using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace Dexpa.WebSite.Models
{
    [ComplexType]
    public class Token
    {
        public string Value { get; set; }

        public DateTime ExpiriedTime { get; set; }



        public Token()
        {
            
        }
    }
}