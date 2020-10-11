require 'sinatra'
require 'kramdown'
require 'haml'

set :port, 80

get '/blog' do

  #return a list of markdown blogposts path
  blogposts_paths = Dir.glob("*", base: "blogs").each { |bp| bp.prepend("./blogs/")}

  blog_id_count = 0

  #render all blogposts as html and return it as a string
  blogposts_html = blogposts_paths.reduce("") do |html, bp_path|
    #gives an unique id for the current post
    blog_id_count += 1
    #render the html of the current post
    blog = md_to_html_parser(bp_path)
    blog_html = haml(:post, :locals => {
      :blog_id => "blog" + blog_id_count.to_s,
      :blog_cover_img => blog[1][0],
      :blog_title => blog[1][1],
      :blog_date => blog[1][2],
      :blog_connections => blog[1][3],
      :blog_abstract => blog[1][4],
      :blog_tags => blog[1][5],
      :blog_content => blog[0]
      })
    html + blog_html
  end


  #haml renders the page with variable passed into the haml templates
  haml(:template, :locals => {:content =>
    haml(:blogpage, :locals => {:blogposts => blogposts_html})})

end

#parse a markdown document into html
def md_to_html_parser blog
  # read a blog in markdown format, get its content
  content = File.read blog

  #adding custom markdown elements by parsing the custom markdown elements into html before Kramdown parse the whole markdown file into html
  bindings = custom_md_parser content

  #parse mardown to html
  blog_detail_content_html = Kramdown::Document.new(bindings[6]).to_html

  return [blog_detail_content_html, bindings]

end

def custom_md_parser md_content
  #cover-img
  cover_img =
    if (/\[cover\-img\]\((.+)\)/).match? md_content
      md_content.match(/\[cover\-img\]\((.+)\)/)[1]
    else
      ""
    end

  if (/\[cover\-img\]\((.+)\)/).match? md_content
    md_content.sub! /\[cover\-img\]\((.+)\)/, ""
  end

  #title
  title = md_content.match(/\#(.+)/)[1]
  md_content.sub! /\#(.+)/, ""

  #date
  date = md_content.match(/\[date\](.+)/)[1]
  md_content.sub! /\[date\](.+)/, ""

  #connections
  connections = md_content.match(/\[connections\](.+)/)[1]
  md_content.sub! /\[connections\](.+)/, ""

  #abstract
  abstract = md_content.match(/\[abstract\]\s(.+)/)[1]
  md_content.sub!(/\[abstract\](.+)/) {|n| "<p>#{$1}</p>"}

  #tags
  tags_string = md_content.match(/\[tags\](.+)/)[1]
  tags = tags_to_list tags_string
  md_content.sub! /\[tags\](.+)/, ""

  #presentation
  md_content.sub!(/\[presentation\]\((.+)\)/) {|n| "<div class='blog-presentation'>" + generate_presentation("#{$1}") + " </div>"}

  return [cover_img, title, date, connections, abstract, tags, md_content]
end


#custom markdown element, generate html structure for presentation markdown custom element
def generate_presentation dir_path
  #return a list of img in the slides directory
  path = File.join("**", dir_path[1..-1], "slide*")
  img_pathlist = Dir.glob path

  #sort the slides by their numbers
  sorted_img_pathlist = img_pathlist.sort_by { |img| img.scan(/\d+/).first.to_i }

  #filter only the list of slides, return a html of the slides
  slides_html = sorted_img_pathlist.reduce("") do |slides, img|
      slides + "<img alt='slide' src='" + img.sub(/public/, "") + "'>"
  end

  return slides_html
end

#custom markdown element, converts string into multiple html elemnts
def tags_to_list tags
  #for connections md element
  tags.gsub!(/\s+/, "")

  if tags == "none"
    return []
  else
    return tags.split(",")
  end
end
