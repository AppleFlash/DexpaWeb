using System.Web.Mvc;
using Dexpa.WebSite.Helpers;
using Dexpa.WebSite.Models;

namespace Dexpa.WebSite.Controllers
{
    public class HomeController : BasicCustomController
    {
        public ActionResult Index()
        {
            if (User.Identity.IsAuthenticated)
            {
                if (User.IsInRole(RoleHelper.StringFromRole(UserRole.Admin)))
                    return RedirectToAction("Index", "Admin");

                if (User.IsInRole(RoleHelper.StringFromRole(UserRole.Dispatcher)))
                    return RedirectToAction("Index", "Dispatcher");

                if (User.IsInRole(RoleHelper.StringFromRole(UserRole.PR)))
                    return RedirectToAction("Index", "Driver");

                if (User.IsInRole(RoleHelper.StringFromRole(UserRole.Cashier)))
                    return RedirectToAction("Index", "CashDesk");

                if (User.IsInRole(RoleHelper.StringFromRole(UserRole.Mechanic)))
                    return RedirectToAction("Index", "CarsDictionary");

                if (User.IsInRole(RoleHelper.StringFromRole(UserRole.Driver)))
                    return RedirectToAction("AccessBlocked", "Home");
            }

            return RedirectToAction("Login", "Account");
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }

        public ActionResult AccessBlocked()
        {
            return View();
        }
    }
}