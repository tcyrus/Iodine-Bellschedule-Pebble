/**
 * TJHSST Bell Schedule For Pebble
 *
 * Creds To fwilson42
 */

var UI=require('ui');
var ajax=require('ajax');
var Vector2=require('vector2');
var Accel=require('ui/accel');
var Vibe=require('ui/vibe');

var parseFeed=function(data) {
  var items=[];
  console.log(data);
  data.schedule.period.forEach(function(period) {
    items.push({title: period.name,subtitle:period.times.start+" - "+period.times.end});
  });
  return items;
};

// Show splash screen while waiting for data
var splashWindow=new UI.Window({
  backgroundColor:'white'
});

// Text element to inform user
var text=new UI.Text({
  position:new Vector2(0,30),
  size:new Vector2(144,40),
  text:'Downloading Bell Schedule Data...',
  font:'GOTHIC_28_BOLD',
  color:'black',
  textOverflow:'wrap',
  textAlign:'center'
});

// Add to splashWindow and show
splashWindow.add(text);
splashWindow.show();

ajax({url:"https://iodine.tjhsst.edu/ajax/dayschedule/json",type:"json"},function(data) {
  // Get the type of Bell Schedule
  var dayType=data.dayname;
  // Create an array of Periods
  var menuItems=parseFeed(data);
  
  if (0===Object.keys(menuItems).length) {
    var dayCard=new UI.Card({
      title:dayType,
      subtitle:"No Periods Available"
    });
    dayCard.show();
  } else {
    // Construct Menu to show to user
    var resultsMenu=new UI.Menu({
      sections:[{
        title:dayType,
        items:menuItems
      }]
    });
    
    // Show the Menu
    resultsMenu.show();
    
    // Add an action for SELECT
    resultsMenu.on('select',function(e) {
      // Create the Card for detailed view
      var detailCard=new UI.Card({
        title:e.item.title,
        subtitle:e.item.subtitle
      });
      detailCard.show();
    });
    
    // Register for 'tap' events
    resultsMenu.on('accelTap',function(e) {
      // Make another request to iodine
      ajax({url:"https://iodine.tjhsst.edu/ajax/dayschedule/json",type:"json"},function(data) {
        // Create an array of Menu items
        var newItems=parseFeed(data);
        
        // Update the Menu's first section
        resultsMenu.items(0,newItems);
        
        // Notify the user
        Vibe.vibrate('short');
      }, function(error) {
        console.log('Download failed: '+error);
      });
    });
  }
  // Hide the splash
  splashWindow.hide();
}, function(error) {
 console.log("Download failed: "+error);
});

// Prepare the accelerometer
Accel.init();