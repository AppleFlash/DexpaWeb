using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.Entity;
using System.Data.Entity.Migrations;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;
using System.Web.Helpers;
using System.Web.Mvc;
using System.Web.Security;
using Dexpa.WebSite.Helpers;
using iTextSharp.text.pdf.qrcode;
using Microsoft.Ajax.Utilities;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.Owin.Security;
using Dexpa.WebSite.Models;
using NLog;

namespace Dexpa.WebSite.Controllers
{
    [Authorize]
    public class AccountController : BasicCustomController
    {
        private ApiClient mApiClient;
        public UserManager<User> UserManager { get; private set; }

        private ApplicationDbContext mContext;

        private AccountManager mAccountManager;

        private Logger mLogger = LogManager.GetCurrentClassLogger();

        private IAuthenticationManager AuthenticationManager
        {
            get
            {
                return HttpContext.GetOwinContext().Authentication;
            }
        }

        public AccountController()
        {
            mContext = new ApplicationDbContext();
            var userStore = new UserStore<User>(mContext);
            UserManager = new UserManager<User>(userStore);
        }

        protected override void Initialize(System.Web.Routing.RequestContext requestContext)
        {
            base.Initialize(requestContext);

            var serverUrl = ConfigurationManager.AppSettings["ApiServer"];
            mApiClient = new ApiClient(serverUrl);
            mAccountManager = new AccountManager(AuthenticationManager, UserManager, mApiClient, mContext);
        }

        public bool IsAuthenticated
        {
            get
            {
                return this.User != null &&
                       this.User.Identity != null &&
                       this.User.Identity.IsAuthenticated;
            }
        }

        //
        // GET: /Account/Login
        [AllowAnonymous]
        public ActionResult Login(string returnUrl)
        {
            if (IsAuthenticated)
            {
                return RedirectToAction("Index", "Home");
            }
            ViewBag.ReturnUrl = returnUrl;
            return View();
        }

        //
        // POST: /Account/Login
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> Login(LoginViewModel model, string returnUrl)
        {
            if (ModelState.IsValid)
            {
                var user = await mAccountManager.SignIn(model.UserName, model.Password, model.RememberMe);
                
                if (user != null)
                {
                    var userRole = mAccountManager.GetUserRole(user);

                    if (!user.HasAccess || userRole == UserRoles.Driver)
                    {
                        return RedirectToAction("AccessBlocked", "Home");
                    }
                    return RedirectToLocal(returnUrl);
                }
            }

            ModelState.AddModelError("", "Неправильное имя пользователя или пароль.");
            return View(model);
        }

        //
        // GET: /Account/Register

        [Authorize(Roles = UserRoles.Admin)]
        public ActionResult Register()
        {
            var model = new RegisterViewModel();
            return View(model);
        }

        //
        // POST: /Account/Register
        [HttpPost]
        [Authorize(Roles = UserRoles.Admin)]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> Register(RegisterViewModel model)
        {
            if (!ModelState.IsValid)
            {
                model.Error = AccountHelper.GetErrorsListFromModel(ModelState);
                return View(model);
            }

            var user = new User()
            {
                Id = Guid.NewGuid().ToString(),
                UserName = model.UserName,
                Name = model.Name,
                LastName = model.LastName,
                MiddleName = model.MiddleName,
                Email = model.Email,
                PhoneNumber = model.PhoneNumber,
                HasAccess = model.HasAccess,
                IpUserName = model.IpPhoneLogin,
                IpPassword = model.IpPhonePassword,
                IpProvider = model.IpPhoneProvider
            };

            try
            {
                await mAccountManager.AddUser(user, model.Password, model.Role);
            }
            catch (Exception exception)
            {
                mLogger.Error(exception);
                model.Error = exception.Message;
                return View(model);
            }

            return RedirectToAction("Index", "Admin");
        }

        //
        // GET: /Account/Manage
        public ActionResult Manage(string userName = null)
        {
            ViewBag.HasLocalPassword = HasPassword();
            ViewBag.ReturnUrl = Url.Action("Manage");

            if (userName == null)
            {
                userName = User.Identity.Name;
            }
            var user = UserManager.FindByNameAsync(userName).Result;

            var model = new ManageUserViewModel();
            model.Email = user.Email;
            model.HasAccess = user.HasAccess;
            model.LastName = user.LastName;
            model.MiddleName = user.MiddleName;
            model.Name = user.Name;
            model.PhoneNumber = user.PhoneNumber;
            model.UserId = user.Id;
            model.IpPhoneLogin = user.IpUserName;
            model.IpPhonePassword = user.IpPassword;
            model.IpPhoneProvider = user.IpProvider;

            var userRole = user.Roles.FirstOrDefault();
            if (userRole != null)
            {
                var currentUserRole = userRole.Role;
                model.Role = currentUserRole.Name;
            }

            model.UserName = user.UserName;

            return View(model);
        }

        [HttpPost]
        public async Task<ActionResult> Delete(string userId = null)
        {
            await mAccountManager.DeleteUser(userId);
            return RedirectToAction("Index", "Admin");
        }

        [HttpGet]
        public string GetUserId(string userName = null)
        {
            if (userName == null)
            {
                userName = User.Identity.Name;
            }
            ApplicationDbContext _db = new ApplicationDbContext();
            var user = _db.Users.FirstOrDefault(u => u.UserName == userName);
            if (user != null)
            {
                return user.Id;
            }
            return "Error";
        }


        [HttpGet]
        public JsonResult GetUser()
        {
            using (var context = new ApplicationDbContext())
            {
                var userName = User.Identity.GetUserName();
                
                var user = context.Users.FirstOrDefault(u => u.UserName == userName);
                if (user != null)
                {
                    return Json(new ManageUserViewModel
                    {
                        IpPhoneLogin = user.IpUserName,
                        IpPhonePassword = user.IpPassword,
                        IpPhoneProvider = user.IpProvider,
                        UserId = user.Id
                    }, JsonRequestBehavior.AllowGet);
                }
                return null;
            }
        }

        //
        // POST: /Account/Manage
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> Manage(ManageUserViewModel model)
        {
            if (!ModelState.IsValid)
            {
                model.Error = AccountHelper.GetErrorsListFromModel(ModelState);
                return View(model);
            }

            try
            {
                await mAccountManager.UpdateUser(model.UserId,
                    model.UserName,
                    model.LastName,
                    model.NewPassword,
                    model.MiddleName,
                    model.Name,
                    model.PhoneNumber,
                    model.Email,
                    model.Role,
                    model.HasAccess,
                    model.IpPhoneLogin,
                    model.IpPhonePassword,
                    model.IpPhoneProvider);

                return RedirectToAction("Index", "Admin");
            }
            catch (Exception exception)
            {
                mLogger.Error(exception);
                model.Error = exception.Message;
                return View(model);
            }
        }


        [AllowAnonymous]
        [HttpGet]
        public JsonResult GetUserToken()
        {
            if (User == null)
            {
                return Json(new { error = "not authorized" }, JsonRequestBehavior.AllowGet);
            }
            var user = UserManager.FindByNameAsync(User.Identity.Name).Result;
            return Json(user.Token, JsonRequestBehavior.AllowGet);
        }
        //
        // POST: /Account/LogOff
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public ActionResult LogOff()
        {
            AuthenticationManager.SignOut();
            return RedirectToAction("Index", "Home");
        }

        //
        // GET: /Account/ExternalLoginFailure
        [AllowAnonymous]
        public ActionResult ExternalLoginFailure()
        {
            return View();
        }

        [ChildActionOnly]
        public ActionResult RemoveAccountList()
        {
            var linkedAccounts = UserManager.GetLogins(User.Identity.GetUserId());
            ViewBag.ShowRemoveButton = HasPassword() || linkedAccounts.Count > 1;
            return (ActionResult)PartialView("_RemoveAccountPartial", linkedAccounts);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing && UserManager != null)
            {
                UserManager.Dispose();
                UserManager = null;

                mContext.Dispose();
                mContext = null;
            }
            base.Dispose(disposing);
        }

        #region Helpers
        // Used for XSRF protection when adding external logins
        private const string XsrfKey = "XsrfId";


        private void AddErrors(IdentityResult result)
        {
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError("", error);
            }
        }

        private bool HasPassword()
        {
            var user = UserManager.FindById(User.Identity.GetUserId());
            if (user != null)
            {
                return user.PasswordHash != null;
            }
            return false;
        }

        public enum ManageMessageId
        {
            ChangePasswordSuccess,
            SetPasswordSuccess,
            RemoveLoginSuccess,
            Error
        }

        private ActionResult RedirectToLocal(string returnUrl)
        {
            if (Url.IsLocalUrl(returnUrl))
            {
                return Redirect(returnUrl);
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }
        }

        private class ChallengeResult : HttpUnauthorizedResult
        {
            public ChallengeResult(string provider, string redirectUri)
                : this(provider, redirectUri, null)
            {
            }

            public ChallengeResult(string provider, string redirectUri, string userId)
            {
                LoginProvider = provider;
                RedirectUri = redirectUri;
                UserId = userId;
            }

            public string LoginProvider { get; set; }
            public string RedirectUri { get; set; }
            public string UserId { get; set; }

            public override void ExecuteResult(ControllerContext context)
            {
                var properties = new AuthenticationProperties() { RedirectUri = RedirectUri };
                if (UserId != null)
                {
                    properties.Dictionary[XsrfKey] = UserId;
                }
                context.HttpContext.GetOwinContext().Authentication.Challenge(properties, LoginProvider);
            }
        }
        #endregion
    }
}