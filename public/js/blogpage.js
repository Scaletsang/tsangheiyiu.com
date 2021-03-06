window.onload = function() {
  setupEventListeners();
  triggerBlogContainerShrink();
  makeMasonryLayout();
}

//============================blog class====================================

function blog(id) {
  this.id = "#" + id;
  this.tags = $(this.id).attr('class').split(/\s+/).slice(1);
  this.connections = $(this.id + " " + ".blog-connections").text();

  //get blog date as string
  let date = $(this.id + " " + ".blog-date").text();
  //set blog day, month and year
  [_, day, monthInAlphabet, this.year] = /(\d+)\s(\w+)\s(\d+)/.exec(date);

  if (day.toString().length == 1) {
    this.day = parseInt("0" + day.toString());
  } else this.day = day

  //convert blog month into numbers so it is easier to sort
  let monthLs = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  this.month = monthLs.indexOf(monthInAlphabet.toLowerCase()) + 1 ;
}

//===================put contents into masonry layout view==========================

function makeMasonryLayout(tags=["none"], excludeId="none") {
  let blogpostsAttrLs = sortAndFilterBLogs(tags, excludeId);
  $(".blog-columns:visible .blogpost").detach().prependTo("#unorganized-blogposts");
  putBlogInColumns(blogpostsAttrLs);

}

function generateFilteredObj(jquerySelectors, excludeId) {
  return $(jquerySelectors)
    .map(function(index, elem) {
      let blogpost = new blog(elem.id);

      if(elem.id == excludeId) {return "needToExclude";}

      return {
        id: blogpost.id,
        tags: blogpost.tags,
        date: parseInt(blogpost.year.toString() + blogpost.month.toString() + blogpost.day.toString())
    }})
}

function sortAndFilterBLogs(selectorLs, excludeId) {
  //filter only the blogpost with certain tags
  let selectors = "";
  if (selectorLs[0] == "none") {
    selectors = ".blogpost"
  } else {
    let jquerySelectorsLs = selectorLs.map(function(item) {
      return "." + item;
    });
    selectors = jquerySelectorsLs.join();
  }

  //return a list of filtered objects,
  //each represents a blogpost with only their id, tags and date values stored
  let blogpostsAttrLs = generateFilteredObj(selectors, excludeId);

  //filter specific blog with its id
  let excludedIdBlogLs = Object.values(blogpostsAttrLs)
    .filter(function(curr){return curr != "needToExclude"});

  excludedIdBlogLs.splice(-2);

  //sort the filtered blogposts by date
  return excludedIdBlogLs.sort(function(a, b){ return a.date-b.date});
}


function putBlogInColumns(sortedFilteredBlogList, count=1, maxCount=$(".blog-columns:visible").length) {

  //base case
  if (sortedFilteredBlogList.length != 0) {

    $(sortedFilteredBlogList[0].id).detach().prependTo($("#column" + count))

    if (count == maxCount) count = 1; else count++;
    //recursion
    putBlogInColumns(sortedFilteredBlogList.slice(1), count, maxCount);
  }
}

//==================masonry layout responsiveness===============================

function triggerBlogContainerShrink() {
  let blogContainerWidth = parseInt($("#multiple-blog-container").css("width"));

  //hides columns when blog container width change
  if(blogContainerWidth > 1033){
    $("#column1, #column2, #column3, #column4").show();
    $(".blog-container").css("justify-content", "center");
  } else if(blogContainerWidth <= 1033 && blogContainerWidth > 753) {
    $("#column1, #column2, #column3").show();
    $("#column4").css("display", "none");
    $(".blog-container").css("justify-content", "center");
  } else if(blogContainerWidth <= 753 && blogContainerWidth > 464){
    $("#column1, #column2").show();
    $("#column4, #column3").css("display", "none");
    $(".blog-container").css("justify-content", "center");
    $(".blog-columns").css("flex-grow", 1);
  } else if(blogContainerWidth <= 464) {
    $("#column1").show();
    $("#column4, #column3, #column2").css("display", "none");
    $(".blog-container").css("justify-content", "center");
    $(".blog-columns").css("flex-grow", 1);
  }
}

//==================event listeners===============================

function setupEventListeners() {
  //view posts
  $(".blogpost").click(function(elem) {
    document.getElementById("single-blog-content").innerHTML = elem.currentTarget.innerHTML;

    //adjust single and mutiple blog container attributes (e.g. width)
    $("#single-blog-container").show();
    $("#single-blog-container").css("width", "50%");
    $("#single-blog-container .blog-detail-content").show();
    $("#single-blog-container .blog-content").css("padding", "0px 20px 20px 20px")
    $("#multiple-blog-container").css("width", "50%");

    //move the blog-tags div up to the top
    $("#single-blog-container .blog-buttons .blog-tags").remove();
    $("#single-blog-content .blog-tags").detach().appendTo("#single-blog-container .blog-buttons");

    //hide the abstract paragraph at the top
    $("#single-blog-content .blog-abstract-paragraph").hide();

    triggerBlogContainerShrink();
    makeMasonryLayout(["none"], elem.currentTarget.id);
  });

  //close button
  $("#close-button").click(function(){
    $("#single-blog-container").css("display", "none");
    $("#multiple-blog-container").show();
    $("#multiple-blog-container").css("width", "100%");
    triggerBlogContainerShrink();
    makeMasonryLayout();
  });

  //span button
  $("#span-button").click(function(){
    $("#multiple-blog-container").css("display", "none");
    $("#single-blog-container").css("width", "100%");
    $("#single-blog-container .blog-content").css({"padding": "0px 10% 0px 10%", "margin-bottom": "40px"});
  });

  //search box
  $("#search-box input").change(function(elem){
    let input = $("#search-box input").val();
    let inputLs = input.split(", ");

    triggerBlogContainerShrink();
    makeMasonryLayout(inputLs, "none");
  })
}
