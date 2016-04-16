using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.SqlTypes;
using System.Linq;
using System.Web;

namespace Dexpa.WebSite.Models
{
    [ComplexType]
    public class UserToken
    {
        public string Token { get; set; }

        public DateTime ExpirationDate { get; set; }

        public UserToken()
        {
            ExpirationDate = SqlDateTime.MinValue.Value;
        }
    }
}