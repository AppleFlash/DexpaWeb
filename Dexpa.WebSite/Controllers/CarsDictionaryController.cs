using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Dexpa.WebSite.Controllers
{
    public class CarsDictionaryController : BasicCustomController
    {
        [Authorize(Roles = "Администратор, Диспетчер, Механик, Тех.поддержка, Кассир")]
        public ActionResult Index()
        {
            return View();
        }

        [Authorize(Roles = "Администратор, Диспетчер, Механик, Тех.поддержка, Кассир")]
        public ActionResult ShowCar(string id)
        {
            ViewData["id"] = id;
            return View();
        }

        [Authorize(Roles = "Администратор, Механик, Тех.поддержка")]
        public ActionResult EditCar(string id)
        {
            ViewData["id"] = id;
            return View();
        }

        [Authorize(Roles = "Администратор, Механик, Тех.поддержка")]
        public ActionResult AddCar()
        {
            return View();
        }
	}
}