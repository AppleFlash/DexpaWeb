using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Dexpa.WebSite.Models.Reports
{
    public class AllOrdersReport
    {
        [TableHeaderText("#", 0, 0), CellParameters(20f, 0, false)]
        public string Id { get; set; }

        public Customer Customer { get; set; }

        [TableHeaderText("Имя, тел. клиента", 0, 0), CellParameters(20f, 0, false)]
        public string CustomerNamePhone { get; set; }

        public StateSource State { get; set; }

        [TableHeaderText("Статус", 0, 0), CellParameters(20f, 0, false)]
        public string StateName { get; set; }

        public Driver Driver { get; set; }

        [TableHeaderText("Позывной", 0, 0), CellParameters(20f, 0, false)]
        public string DriverCallsignPhone { get; set; }

        [TableHeaderText("Контрольное время", 0, 0), CellParameters(20f, 0, false)]
        public string DepartureDate { get; set; }

        [TableHeaderText("Принял", 0, 0), CellParameters(20f, 0, false)]
        public string AcceptTime { get; set; }

        [TableHeaderText("Время на месте", 0, 0), CellParameters(20f, 0, false)]
        public string StartWaitTime { get; set; }

        [TableHeaderText("Адрес подачи", 0, 0), CellParameters(20f, 0, false)]
        public string FromAddress { get; set; }

        [TableHeaderText("Тариф", 0, 0), CellParameters(20f, 0, false)]
        public string TariffShortName { get; set; }

        [TableHeaderText("Сумма по таксометру", 0, 0), CellParameters(20f, 2, false)]
        public double Cost { get; set; }
        public StateSource Source { get; set; }

        [TableHeaderText("Источник", 0, 0), CellParameters(20f, 0, false)]
        public string SourceName { get; set; }
    }


    public class StateSource
    {
        public string Name { get; set; }
    }

    public class Driver
    {
        public string Callsign { get; set; }
        public long[] Phones { get; set; }
    }

    public class Customer
    {
        public string Name { get; set; }
        public string Phone { get; set; }
    }
}