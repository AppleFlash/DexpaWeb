using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Dexpa.WebSite.Controllers
{
    public class CarEventsController : Controller
    {
        // GET: CarEvents
        [Authorize(Roles = "Администратор, Механик, Тех.поддержка")]
        public ActionResult Index(string id)
        {
            ViewData["id"] = id;
            return View();
        }

        [Authorize(Roles = "Администратор, Механик, Тех.поддержка")]
        public ActionResult Repairs(string id)
        {
            ViewData["id"] = id;
            return View();
        }

        [Authorize(Roles = "Администратор, Механик, Тех.поддержка")]
        public ActionResult AddRepair(string id)
        {
            ViewData["id"] = id;
            ViewData["userName"] = User.Identity.Name;
            return View();
        }

        [Authorize(Roles = "Администратор, Механик, Тех.поддержка")]
        public ActionResult ShowRepair(string id)
        {
            ViewData["id"] = id;
            ViewData["userName"] = User.Identity.Name;
            return View();
        }

        [Authorize(Roles = "Администратор, Механик, Тех.поддержка")]
        public ActionResult EditRepair(string id)
        {
            ViewData["id"] = id;
            ViewData["userName"] = User.Identity.Name;
            return View();
        }

        [Authorize(Roles = "Администратор, Механик, Тех.поддержка")]
        public ActionResult AddCarEvent(string id)
        {
            ViewData["id"] = id;
            ViewData["userName"] = User.Identity.Name;
            return View();
        }

        [Authorize(Roles = "Администратор, Механик, Тех.поддержка")]
        public ActionResult EditCarEvent(string id)
        {
            ViewData["id"] = id;
            ViewData["userName"] = User.Identity.Name;
            return View();
        }

        [Authorize(Roles = "Администратор, Механик, Тех.поддержка")]
        public ActionResult ShowCarEvent(string id)
        {
            ViewData["id"] = id;
            ViewData["userName"] = User.Identity.Name;
            return View();
        }
    }
}