using System.Web.Mvc;
using Dexpa.WebSite.Models;

namespace Dexpa.WebSite.Controllers
{
    public class DispatcherController : BasicCustomController
    {
        [Authorize(Roles = "Администратор, Диспетчер,Тех.поддержка")]
        public ActionResult Index()
        {
            ViewData["userName"] = User.Identity.Name;
            return View();
        }

        [Authorize(Roles = "Администратор, Диспетчер, Тех.поддержка")]
        public ActionResult NewOrder()
        {
            return View();
        }

        [Authorize(Roles = "Администратор, Диспетчер, Тех.поддержка")]
        public ActionResult UpdateOrder(string id)
        {
            ViewData["id"] = id;
            return View();
        }

        [Authorize(Roles = "Администратор, Диспетчер, Тех.поддержка")]
        public ActionResult ShowOrder(string id)
        {
            ViewData["id"] = id;
            return View();
        }
        
        public ActionResult Phone()
        {
            return View("_PhoneWidget");
        }
    }
}