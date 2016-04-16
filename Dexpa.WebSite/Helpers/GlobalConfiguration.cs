using System.Collections.Generic;
using System.Configuration;
using System.Reflection;
using System.Security.Principal;
using System.Web.Mvc;
using Dexpa.WebSite.Models;

namespace Dexpa.WebSite.Helpers
{
    public class GlobalConfiguration
    {
        public static string GetApiServerUrl()
        {
            return ConfigurationManager.AppSettings["ApiServer"];
        }

        public static List<SelectListItem> GetRolesList()
        {
            ApplicationDbContext _db = new ApplicationDbContext();

            var roleList = new List<SelectListItem>();
            foreach (var role in _db.Roles)
            {
                if (role.Name == "Водитель")
                    continue;
                
                var Item = new SelectListItem();
                Item.Text = role.Name;
                Item.Value = role.Name;
                roleList.Add(Item);
            }
            return roleList;
        }

        public static RoleAccessModel roleAccessModel;

        public static string CurrentVersion()
        {
            return "1.10.1";
        }
    }
}