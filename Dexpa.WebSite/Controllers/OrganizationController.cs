using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Dexpa.WebSite.Controllers
{
    [Authorize(Roles = "Администратор, Диспетчер, Тех.поддержка")]
    public class OrganizationController : Controller
    {
        //
        // GET: /Organization/
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult Add()
        {
            return View();
        }

        public ActionResult Edit(string id)
        {
            ViewData["id"] = id;
            return View();
        }
	}
}