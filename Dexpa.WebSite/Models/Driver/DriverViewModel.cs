using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Dexpa.WebSite.Models.Driver
{
    public class DriverViewModel
    {
        public List<DriversTableRow> DriversList { get; set; }

        public DriverViewModel()
        {
            DriversList = new List<DriversTableRow>();
        }

        public void Add(DriversTableRow driversTableRow)
        {
            DriversList.Add(driversTableRow);
        }
    }
}