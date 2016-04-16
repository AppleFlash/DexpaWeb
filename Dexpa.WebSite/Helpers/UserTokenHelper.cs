using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using Dexpa.WebSite.Models;

namespace Dexpa.WebSite.Helpers
{
    public static class UserTokenHelper
    {
        public const int TokenRefreshTimeMinutes = 5;

        public static UserToken GetToken(string userName)
        {
            using (var context = new ApplicationDbContext())
            {
                var user = context.Users.FirstOrDefault(u => u.UserName == userName);
                if (user != null)
                {
                    return user.Token;
                }
            }
            return null;
        }
    }
}