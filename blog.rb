require 'sinatra'
require 'kramdown'
require 'haml'

set :public_folder, __dir__ + './public'

get '/blog' do

  #load all required template
  template = Haml::Engine.new File.read('views/template.haml')
  blogpage = Haml::Engine.new File.read('views/blogpage.haml')
  post = Haml::Engine.new File.read('views/post.haml')

  #return a list of markdown blogposts path
  blogposts_paths = Dir.glob("*", base: "blogs").each { |bp| bp.prepend("./blogs/")}

  #render all blogposts as html and return it as a list
  blogposts_html = blogposts_paths.map { |bp_path| md_to_html_parser(bp_path) }

  #render the template, and the blogs
  template.render(Object.new, :content =>  blogpage.render(Object.new, :blogposts => post.render(Object.new,
    { :blog_cover_img => blogposts_html[1][0],
    :blog_title => blogposts_html[1][1],
    :blog_date => blogposts_html[1][2],
    :blog_connections => blogposts_html[1][3],
    :blog_abstract => blogposts_html[1][4],
    :blog_content => blogposts_html[0]}
  )))

end

#parse a markdown document into html
def md_to_html_parser blog
  # read a blog in markdown format, get its content
  content = File.read blog

  #adding custom markdown elements by parsing the custom markdown elements into html before Kramdown parse the whole markdown file into html
  bindings = custom_md_parser content

  #parse mardown to html
  blog_detail_content_html = Kramdown::Document.new(bindings[5]).to_html

  print bindings[0], bindings[1], bindings[2], bindings[3], bindings[4]
  return [blog_detail_content_html, bindings]

end


def custom_md_parser md_content
  #cover-img
  if (/\[cover\-img\]\((.+)\)/).match? md_content
    cover_img = md_content.match(/\[cover\-img\]\((.+)\)/)[1]
    md_content.sub! /\[cover\-img\]\((.+)\)/, ""
  end

  #title
  title = md_content.match(/\#(.+)/)[1]
  md_content.sub! /\#(.+)/, ""

  #date
  date = md_content.match(/\[date\](.+)/)[1]
  md_content.sub! /\[date\](.+)/, ""

  #abstract
  abstract = md_content.match(/\[abstract\](.+)/)[1]
  md_content.sub! /\[abstract\](.+)/, ""

  #connections
  connections = md_content.match(/\[connections\](.+)/)[1]
  md_content.sub! /\[connections\](.+)/, ""

  #presentation
  md_content.sub!(/\[presentation\]\((.+)\)/) {|n| "<div class='blog-presentation'>" + generate_presentation("#{$1}") + " </div>"}

  #tags
  md_content.sub!(/\[tags\](.+)/) {|n| "<div class='blog-tags'>" + tags_to_html("," + "#{$1}") + " </div>"}

  return [cover_img, title, date, connections, abstract, md_content]
end

#custom markdown element, generate html structure for presentation markdown custom element
def generate_presentation img_path
  #return a list of img in the slides directory
  img_pathlist = Dir.glob("*", base: img_path.match(/.\/(media\/.+)\//)[1])

  #filter only the list of slides, return a html of the slides
  slides_html = img_pathlist.reduce("") do |slides, img|
    if /slide\d+\..+/.match? img
      puts img
      slides + "<img alt='slide' src='" + img + "'>"
    else slides
    end
  end

  return slides_html
end

#custom markdown element, converts string into multiple html elemnts
def tags_to_html tags
  #for connections md element
  if tags == /,\s"none"/
    return ""
  end

  tag_list = tags.split(/,\s/)
  tag_html = tag_list.reduce(" ") {|ls, tag| ls + "<p>#{tag}</p>"}
  return tag_html
end
