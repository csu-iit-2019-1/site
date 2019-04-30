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
        private const string BOOKING_SERVICE_URL = "http://localhost:4044/api/booking/";

        // GET: Tour
        public ActionResult Index(int? siteId)
        {
            if (siteId != null) ViewBag.siteId = siteId;
            return View();
        }

        public JsonResult Book()
        {
            Stream req = Request.InputStream;
            req.Seek(0, System.IO.SeekOrigin.Begin);
            string json = new StreamReader(req).ReadToEnd();
            var response = Requester.SendPostWaitStatus(BOOKING_SERVICE_URL, json);
            var result = "";
            if (response == 200) result = "ok";
            else result = "bad";
            return Json(result, JsonRequestBehavior.AllowGet);
        }
    }
}