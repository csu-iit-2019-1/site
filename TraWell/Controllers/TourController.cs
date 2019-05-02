using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using TraWell.Services;

namespace TraWell.Controllers
{
    public class TourController : Controller
    {
        private const string BOOKING_SERVICE_URL = "https://csubookingservice.azurewebsites.net/";

        // GET: Tour
        public ActionResult Index(int siteId, string checkNumber)
        {
            ViewBag.siteId = siteId;
            if (checkNumber != null && checkNumber != "")
            {
                var response = Requester.SendGetWaitStatus(BOOKING_SERVICE_URL + "buying/"+siteId);
                if (response == 200) ViewBag.isPayed = true;
            }
            return View();
        }

        public JsonResult Book()
        {
            Stream req = Request.InputStream;
            req.Seek(0, System.IO.SeekOrigin.Begin);
            string json = new StreamReader(req).ReadToEnd();
            var response = Requester.SendPOST(BOOKING_SERVICE_URL + "booking/route", json);
            return Json(response, JsonRequestBehavior.AllowGet);
        }
    }
}