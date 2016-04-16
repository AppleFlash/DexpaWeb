using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Dexpa.WebSite.Models.Reports
{
    public class DriverTimeReport
    {
        [TableHeaderText("Водитель", 0, 2), CellParameters(20f, 0, false)]
        public string DriverName { get; set; }

        [TableHeaderText("Среднее время в сутки, часов", 4, 0), CellParameters(20f, 2, false)]
        public string Time { get; set; }

        [TableHeaderText("Онлайн", 0, 0, true), CellParameters(20f, 2, false)]
        public double OnlineTime { get; set; }

        [TableHeaderText("На заказе", 0, 0, true), CellParameters(20f, 2, false)]
        public double OnOrderTime { get; set; }

        [TableHeaderText("Свободен", 0, 0, true), CellParameters(20f, 2, false)]
        public double FreeTime { get; set; }

        [TableHeaderText("Занят", 0, 0, true), CellParameters(20f, 2, false)]
        public double BusyTime { get; set; }

        [TableHeaderText("Эффективность, %", 0, 2), CellParameters(20f, 2, false)]
        public string Efficiency { get; set; }
    }
}