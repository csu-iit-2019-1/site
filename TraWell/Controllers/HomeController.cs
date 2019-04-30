using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using TraWell.Models;
using TraWell.Services;

namespace TraWell.Controllers
{
    public class HomeController : Controller
    {
        private const string CITY_SERVICE_URL = "http://localhost:4044/api/city/";
        private const string EVENTS_SERVICE_URL = "http://localhost:4044/api/events/";
        private const string ROUTES_SERVICE_URL = "http://localhost:4044/api/routes/";

        public ActionResult Index()
        {
            return View();
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }

        public JsonResult CitiesList()
        {
            var response = cutResponse(Requester.SendGET(CITY_SERVICE_URL));
            return Json(response, JsonRequestBehavior.AllowGet);
        }

        public JsonResult CityInfo(int id)
        {
            var response = cutResponse(Requester.SendGET(CITY_SERVICE_URL + id));
            return Json(response, JsonRequestBehavior.AllowGet);
        }

        public JsonResult CityEvents()
        {
            Stream req = Request.InputStream;
            req.Seek(0, System.IO.SeekOrigin.Begin);
            string json = new StreamReader(req).ReadToEnd();
            var response = cutResponse(Requester.SendPOST(EVENTS_SERVICE_URL, json));
            return Json(response, JsonRequestBehavior.AllowGet);
        }

        public JsonResult Routing()
        {
            Stream req = Request.InputStream;
            req.Seek(0, System.IO.SeekOrigin.Begin);
            string json = new StreamReader(req).ReadToEnd();
            var response = cutResponse(Requester.SendPOST(ROUTES_SERVICE_URL, json));
            return Json(response, JsonRequestBehavior.AllowGet);
        }

        public JsonResult Weather()
        {
            Stream req = Request.InputStream;
            req.Seek(0, SeekOrigin.Begin);
            string json = new StreamReader(req).ReadToEnd();
            var response = cutResponse(Requester.SendPOST(CITY_SERVICE_URL, json));
            return Json(response, JsonRequestBehavior.AllowGet);

        }

        private string cutResponse(string response)
        {
            response = response.Replace("\\", "");
            response = response.Substring(1, response.Length - 2);
            return response;
        }
    }
}