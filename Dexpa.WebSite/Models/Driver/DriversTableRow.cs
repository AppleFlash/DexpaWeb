using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Dexpa.WebSite.Models.Driver
{
    public class DriversTableRow
    {
        public string Callsign { get; set; }
        public string ChangeType { get; set; }
        public string Name { get; set; }
        public string Car { get; set; }
        public string CarNumber { get; set; }
        public string Version { get; set; }
        public string Conditions { get; set; }
        public string CreatedDate { get; set; }
        public string Phone { get; set; }
    }
}