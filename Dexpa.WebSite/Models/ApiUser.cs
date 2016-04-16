using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Dexpa.WebSite.Helpers;

namespace Dexpa.WebSite.Models
{
    public class ApiUser
    {
        public string UserName { get; set; }

        public string Password { get; set; }

        public string Name { get; set; }

        public string LastName { get; set; }

        public string MiddleName { get; set; }

        public UserRole Role { get; set; }

        public string OldUserName { get; set; }

        public string IpUserName { get; set; }

        public string IpPassword { get; set; }

        public string IpProvider { get; set; }
    }
}