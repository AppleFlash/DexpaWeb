using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Web;
using System.Web.Mvc;
using Dexpa.WebSite.Models.Dispatcher;

namespace Dexpa.WebSite.Controllers
{
    public class ClientsController : BasicCustomController
    {
        //
        // GET: /Clients/
        [Authorize(Roles = "Администратор, Диспетчер,Тех.поддержка")]
        public ActionResult Index()
        {
            return View();
        }
	}
}