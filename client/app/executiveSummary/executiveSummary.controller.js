// controller for the product's page
angular.module('threat').controller('ExecutiveSummaryController', function($http, values) {
    var vm = this;
    var url = values.get('api') + '/';


    //// --------  TABLE SECTION -------- ////
     // populate recordData array with counts of categories
     var recordCategories = [["products", "Products"], ["threatFeeds", "Threat Feeds"], ["users", "Users"]];
     var getRecordCounts = function(category){
       $http.get(url + 'count/' + category[0]).then(function(response){
         var count = response.data[0]["COUNT(*)"];
         vm.recordData.push({Name:category[1], Count:count});
       });
     };;
    vm.recordData = [];
    for(var x = 0; x < recordCategories.length; x++){
      getRecordCounts(recordCategories[x], vm.recordData);
    }


    var stringifyDate = function(dateRange) {
      var month = (dateRange.getMonth()+1).toString();
      if (month.length == 1) {
        month = "0" + month;
      }
      var day = dateRange.getDate().toString();
      if (day.length == 1) {
        day = "0" + day;
      }
      var year = dateRange.getFullYear() % 100;
      return month + '-' + day + '-' + year.toString();
    };

    // update the table given a string input or an optional date range
    vm.updateTable = function(model, rangeStart, rangeEnd) {
        vm.feedData = [];
        var getAllFeeds = function(){
            $http.get(url + 'count/feeds').then(function(response){
              for (var j=0; j<response.data.length; j++) {
                vm.feedData.push({Feed: response.data[j]["feed_title"], Count: response.data[j]["feed_count"]});
              }
            });
          };
        var getDateFeeds = function(start, end) {
          $http.get(url + 'count/feeds/' + start +'/' + end).then(function(response){
            for (var j=0; j<response.data.length; j++) {
              vm.feedData.push({Feed: response.data[j]["feed_title"], Count: response.data[j]["feed_count"]});
            }
          });
        }
        if (model == "All Time") {
          getAllFeeds();
        } else {
          var today = new Date(); // TODO new Date('December 31, 2017') for testing/demo
          if (model == "Past Week") {
            var dateRange = new Date(today.getTime() - (86400 * 1000 * 7));
          } else if (model == "Past Month") {
            var dateRange = new Date(today.getTime() - (86400 * 1000 * 31));
          } else {
            today = rangeEnd;
            var dateRange = rangeStart;
          }
          var start = stringifyDate(dateRange);
          var end = stringifyDate(today);
          getDateFeeds(start, end);
        }
      };

    //// --------  CHART SECTION -------- ////
      // graphing options for line chart customization
      vm.lineOverride = {
          label: "Records",
          backgroundColor: "rgba(237, 83, 98, 0.8)",
          hoverbackgroundColor: "rgba(237, 83, 98, 0.6)",
          borderColor: "rgba(237, 83, 98, 0.6)",
          borderWidth: 1
      };

      vm.lineOptions = {
                elements: {
                  line: {
                    tension:0.3
                  },
                  point:{
                    radius:2
                  },
                },
                scales: {
                        yAxes: [{
                            scaleLabel: {
                              display: true,
                              labelString: "Number of Threats"
                            },
                            ticks: {
                                beginAtZero:true
                            }
                        }],
                        xAxes: [{
                          ticks: {
                            autoSkip: true,
                            autoSkipPadding: 10
                          }
                        }]
                    },
                title: {
                    display: false,
                    text: 'Threat Activity'
                  },
                legend: {
                    display: false
                },
              };


    // update the chart given a string input or an optional date range
     vm.updateChart = function(model, rangeStart, rangeEnd) {
         vm.threatDates = [];
         vm.threatCount = [];
         var getAllThreats = function(){
             $http.get(url + 'count/threats').then(function(response){
               for (var j=0; j<response.data.length; j++) {
                 vm.threatDates.push(response.data[j]["threat_date"]);
                 vm.threatCount.push(response.data[j]["threat_count"]);
               }
             });
           };
         var getDateThreats = function(start, end) {
           $http.get(url + 'count/threats/' + start +'/' + end).then(function(response){
             for (var j=0; j<response.data.length; j++) {
               vm.threatDates.push(response.data[j]["threat_date"]);
               vm.threatCount.push(response.data[j]["threat_count"]);
             }
           });
         };
         if (model == "All Time") {
           getAllThreats();
           vm.lineOptions.elements.point.radius = 1;
         } else {
           var today = new Date(); // TODO new Date('December 31, 2017') for testing/demo
           if (model == "Past Week") {
             var dateRange = new Date(today.getTime() - (86400 * 1000 * 7));
           } else if (model == "Past Month") {
             var dateRange = new Date(today.getTime() - (86400 * 1000 * 31));
           } else {
             today = rangeEnd;
             var dateRange = rangeStart;
           }
           var start = stringifyDate(dateRange);
           var end = stringifyDate(today);
           getDateThreats(start, end);
           vm.lineOptions.elements.point.radius = 3;
         }
       };

    // graphing options for bar graph customization
    vm.barOverride = {
                    label: "Records",
                    backgroundColor: "rgba(54, 162, 235, 0.8)",
                    hoverBackgroundColor: "rgba(54, 162, 235, 0.6)",
                    borderColor: "rgba(54, 162, 235, 0.8)",
                    borderWidth: 1
                  };
    vm.barOptions =  {
                    scales: {
                      yAxes: [{
                          scaleLabel: {
                            display: true,
                            labelString: "Number of Records"
                          },
                          ticks: {
                              beginAtZero:true
                          }
                      }],
                  },
                  title: {
                    display: false,
                    text: 'Number of Records'
                  },
                  legend: {
                    display: false
                  },
              };

    // populate entryData array with counts of categories
    var getBarCounts = function(){
      $http.get(url + 'count/bar-graph').then(function(response){
        for (var j=0; j<response.data.length; j++) {
          vm.entryData.push(response.data[j]["NUM_ROWS"]);
        }
      });
    };
    vm.entryData = [];
    vm.entryLabels = ["Assets", "Attack Types", "Attacker Types", "Attack Vectors", ["Vulnerability", "Types"]];
    getBarCounts();


    // range selector function for line chart and feeds table
    $(function() {

      var start, end, tableStart, tableEnd;
      start = tableStart = moment().subtract(365, 'days');
      end = tableEnd = moment();


      // update chart with threat count within date range
      function chartRange(start, end) {
          startFormatted = start.format('MMMM D, YYYY');
          endFormatted = end.format('MMMM D, YYYY');

          // manually check the date range, and update the chart accordingly
          if (endFormatted == moment().format('MMMM D, YYYY')) {
            if (startFormatted == moment().subtract(365, 'days').format('MMMM D, YYYY')) {
              vm.updateChart("All Time", 0, 0);
              $('#linechartRange span').html("All Time");
             } else if (startFormatted == moment().subtract(29, 'days').format('MMMM D, YYYY')) {
               vm.updateChart("Past Month", 0, 0);
               $('#linechartRange span').html("Past Month");
             } else {
               vm.updateChart("Past Week", 0, 0);
               $('#linechartRange span').html("Past Week");
             }
          } else {
            vm.updateChart("Custom", start.toDate(), end.toDate());
            $('#linechartRange span').html(startFormatted + ' - ' + endFormatted);
          }
      }

      // update table with threat feeds count within date range
      function tableRange(start, end) {
          startFormatted = start.format('MMMM D, YYYY');
          endFormatted = end.format('MMMM D, YYYY');

          // manually check the date range, and update the chart accordingly
          if (endFormatted == moment().format('MMMM D, YYYY')) {
            if (startFormatted == moment().subtract(365, 'days').format('MMMM D, YYYY')) {
              vm.updateTable("All Time", 0, 0);
              $('#feedtableRange span').html("All Time");
             } else if (startFormatted == moment().subtract(29, 'days').format('MMMM D, YYYY')) {
               vm.updateTable("Past Month", 0, 0);
               $('#feedtableRange span').html("Past Month");
             } else {
               vm.updateTable("Past Week", 0, 0);
               $('#feedtableRange span').html("Past Week");
             }
          } else {
            vm.updateTable("Custom", start.toDate(), end.toDate());
            $('#feedtableRange span').html(startFormatted + ' - ' + endFormatted);
          }
      }

      $('#linechartRange').daterangepicker({
          opens:'left',
          drops:'down',
          alwaysShowCalendars: false,
          startDate: start,
          endDate: end,
          ranges: {
            'All Time': [moment().subtract(365, 'days'), moment()],
            'Past Month': [moment().subtract(29, 'days'), moment()],
            'Past Week': [moment().subtract(6, 'days'), moment()],
          }
          }, chartRange);


      $('#feedtableRange').daterangepicker({
          opens:'left',
          drops:'down',
          alwaysShowCalendars: false,
          startDate: start,
          endDate: end,
          ranges: {
            'All Time': [moment().subtract(365, 'days'), moment()],
            'Past Month': [moment().subtract(29, 'days'), moment()],
            'Past Week': [moment().subtract(6, 'days'), moment()],
          }
        }, tableRange);

      chartRange(start, end);
      tableRange(tableStart, tableEnd);
    });
});
