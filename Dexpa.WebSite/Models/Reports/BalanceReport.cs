using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Dexpa.WebSite.Models.Reports
{
    public class BalanceReport
    {
        [TableHeaderText("Позывной", 0, 0), CellParameters(50f, 0, false)]
        public string Callsign { get; set; }

        [TableHeaderText("Водитель", 0, 0), CellParameters(50f, 0, false)]
        public string Name { get; set; }

        [TableHeaderText("ТС", 0, 0), CellParameters(50f, 0, false)]
        public string CarName { get; set; }

        [TableHeaderText("Условие работы", 0, 0), CellParameters(50f, 0, false)]
        public string WorkConditions { get; set; }

        [TableHeaderText("Статус водителя", 0, 0), CellParameters(50f, 0, false)]
        public string DriverStateName { get; set; }

        [TableHeaderText("Телефон", 0, 0), CellParameters(50f, 0, false)]
        public string Phone { get; set; }

        [TableHeaderText("Аренда", 0, 0), CellParameters(50f, 2, false)]
        public double RentCost { get; set; }

        [TableHeaderText("Лимит", 0, 0), CellParameters(50f, 2, false)]
        public double MoneyLimit { get; set; }

        [TableHeaderText("На счете", 0, 0), CellParameters(50f, 2, false)]
        public double Balance { get; set; }

        public long DriverId { get; set; }

        public long DriverState { get; set; }
    }
}