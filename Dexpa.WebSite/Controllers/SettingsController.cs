using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Web;
using System.Web.Mvc;

namespace Dexpa.WebSite.Controllers
{
    [Authorize(Roles = "Администратор, Тех.поддержка")]
    public class SettingsController : Controller
    {
        //
        // GET: /Settings/
        public ActionResult Index()
        {
            return View();
        }
         [Authorize(Roles = "Администратор, Тех.поддержка")]
        public ActionResult Edit(string id)
        {
            ViewData["id"] = id;
            return View();
        }
    }
}