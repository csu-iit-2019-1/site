using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace TraWell.Controllers
{
    public class TourController : Controller
    {
        // GET: Tour
        public ActionResult Index(int siteId)
        {
            ViewBag.siteId = siteId;
            return View();
        }

        public ActionResult Index()
        {
            return View();
        }
    }
}