using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Dexpa.WebSite.Models.Dispatcher
{
    public class OrdersTableRow
    {
        public int OrderNum { get; set; }
        public string Countdown { get; set; }
        public string Phone { get; set; }
        public string District { get; set; }
        public string StartAddress { get; set; }
        public string DestinationAddress { get; set; }
        public string Time { get; set; }
        public bool IsAccept { get; set; }
        public string Callsign { get; set; }
        public string Tariff { get; set; }
        public int Payment { get; set; }
        public int Summ { get; set; }
        public string AcceptDate { get; set; }
        public string OnSpotTime { get; set; }
        public int TotalOrdersCount { get; set; }
    }
}