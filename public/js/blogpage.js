window.onload = function() {
  setupEventListeners();
}

function makeMasonryLayout() {

}

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

//event listeners

function setupEventListeners() {

  //view posts
  $(".blog-cover-img, .blog-title").click(function() {
    $("#single-blog-container").show();
    $("#single-blog-container").css("width", "50%");
    $("#single-blog-container .blog-detail-content").show();
    $("#multiple-blog-container").css("width", "50%");

    triggerBlogContainerShrink();
    makeMasonryLayout();
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
  });

  //trigger when scolling
  $("#content-container").scroll(function(e){

    //search bar motion-up
    let searchBoxTop = 20;
    let scrollY = e.target.scrollTop;

    if (scrollY <= 45) searchBoxTop = 45;
    else if (scrollY > 45 && scrollY <= 65) searchBoxTop =  150 - scrollY;

    $("#search-box").css("top", searchBoxTop);
  });
}
