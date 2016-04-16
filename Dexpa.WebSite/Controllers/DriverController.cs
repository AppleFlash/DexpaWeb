using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Web;
using System.Web.Mvc;
using Dexpa.WebSite.Models.Driver;

namespace Dexpa.WebSite.Controllers
{
    public class DriverController : BasicCustomController
    {
        //
        // GET: /Driver/
        [Authorize(Roles = "Администратор, Диспетчер, Кассир, Механик, Тех.поддержка")]
        public ActionResult Index()
        {
            return View();
        }

        [Authorize(Roles = "Администратор, Тех.поддержка")]
        public ActionResult AddDriver()
        {
            return View();
        }

        [Authorize(Roles = "Администратор, Тех.поддержка")]
        public ActionResult EditDriver(string id)
        {
            ViewData["id"] = id;
            return View();
        }

        [Authorize(Roles = "Администратор, Диспетчер, Кассир, Механик, Тех.поддержка")]
        public ActionResult ShowDriver(string id)
        {
            ViewData["id"] = id;
            return View();
        }
	}
}