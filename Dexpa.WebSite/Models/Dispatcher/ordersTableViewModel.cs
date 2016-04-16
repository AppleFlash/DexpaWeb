using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Dexpa.WebSite.Models.Dispatcher
{
    public class OrdersTableViewModel
    {
        public List<OrdersTableRow> OrdersList { get; set; }

        public OrdersTableViewModel()
        {
            OrdersList = new List<OrdersTableRow>();
        }
    }

}
