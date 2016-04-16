using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Dexpa.WebSite.Models;

namespace Dexpa.WebSite.Controllers
{
    public class WayBillsController : Controller
    {
        // GET: WayBills
        [Authorize(Roles = "Администратор, Тех.поддержка, Кассир, Механик, Диспетчер")]
        public ActionResult Index()
        {
            return View();
        }

        [Authorize(Roles = "Администратор, Тех.поддержка, Кассир, Механик, Диспетчер")]
        public ActionResult Active()
        {
            return View();
        }

        [Authorize(Roles = "Администратор, Тех.поддержка, Кассир, Механик")]
        public ActionResult Add()
        {
            return View();
        }

        [Authorize(Roles = "Администратор, Тех.поддержка, Кассир, Механик")]
        public ActionResult Edit(string id)
        {
            ViewData["id"] = id;
            return View();
        }

        [Authorize(Roles = "Администратор, Тех.поддержка, Кассир, Механик, Диспетчер")]
        public ActionResult Print(string id)
        {
            ViewData["id"] = id;
            return View();
        }

        public JsonResult GetUsers()
        {
            var model = new AdminViewModel();
            model.UsersList = new List<UserRow>();

            using (var context = new ApplicationDbContext())
            {
                var usrs = context.Users.ToList();
                foreach (var user in usrs)
                {
                    var role = user.Roles.FirstOrDefault();
                    var u = new UserRow
                    {
                        Role = role != null ? role.Role.Name : string.Empty,
                        UserName = user.UserName,
                        LastName = user.LastName,
                        Name = user.Name,
                        MiddleName = user.MiddleName,
                        PhoneNumber = user.PhoneNumber,
                        Email = user.Email,
                        HasAccess = user.HasAccess,
                        Id = user.Id,
                    };
                    model.UsersList.Add(u);
                }
                return Json(model.UsersList, JsonRequestBehavior.AllowGet);
            }
        }
    }
}