using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using Dexpa.WebSite.Models;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;

namespace Dexpa.WebSite.Helpers
{
    public class UserNotBlockAttribute : AuthorizeAttribute
    {
        private UserManager<User> UserManager { get; set; }

        private ApplicationDbContext mContext;

        private bool _userHasAccess = true;

        public UserNotBlockAttribute()
        {
            mContext = new ApplicationDbContext();
            var userStore = new UserStore<User>(mContext);
            UserManager = new UserManager<User>(userStore);
        }

        protected override bool AuthorizeCore(HttpContextBase httpContext)
        {
            if (httpContext == null)
                throw new ArgumentNullException("httpContext");

            GlobalConfiguration.roleAccessModel = new RoleAccessModel();

            var request = httpContext.Request;
            string controller = request.RequestContext.RouteData.Values["controller"].ToString();
            _userHasAccess = true;

            if (controller == "Home")
            {
                return true;
            }

            if (!httpContext.User.Identity.IsAuthenticated)
                return false;

            var user = UserManager.FindByName(httpContext.User.Identity.Name);
            _userHasAccess = user.HasAccess;
            GlobalConfiguration.roleAccessModel = new RoleAccessModel(httpContext.User, _userHasAccess);

            if (!user.HasAccess)
            {
                _userHasAccess = false;
                return false;
            }

            return true;
        }

        public override void OnAuthorization(AuthorizationContext filterContext)
        {
            base.OnAuthorization(filterContext);
            bool flag = filterContext.ActionDescriptor.IsDefined(typeof(AllowAnonymousAttribute), true) || 
                filterContext.ActionDescriptor.ControllerDescriptor.IsDefined(typeof(AllowAnonymousAttribute), true);
            if (flag)
            {
                return;
            }

            if (_userHasAccess) return;

            filterContext.Controller.TempData["controller"] = filterContext.RouteData.Values["controller"];
            filterContext.Controller.TempData["action"] = filterContext.RouteData.Values["action"];
            filterContext.Result = new RedirectToRouteResult(new RouteValueDictionary(new { controller = "Home", action = "AccessBlocked" }));
        }
    }
}