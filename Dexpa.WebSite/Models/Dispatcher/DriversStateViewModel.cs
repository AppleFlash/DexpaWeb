using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Dexpa.WebSite.Models.Dispatcher
{
    public class DriversStateViewModel
    {
        public string Callsign { get; set; }
        public string PhotoPath { get; set; }
        public string Name { get; set; }
        public string CarName { get; set; }
        public string DriverGroup { get; set; }
        public string WorkingTime { get; set; }
        public string StateChangeTime { get; set; }
        public string State { get; set; }
    }
}
