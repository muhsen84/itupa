library(shiny)
library(shinyjs)
library(shinyalert)
library(shinyWidgets)
library(googleway)
library(googlePolylines)
library(colourpicker)
library(shinycssloaders)
library(DT)


options(shiny.maxRequestSize=30*1024^2)



ui <- fluidPage(

  tags$head(HTML("<title>iTUPA</title>")),
  tags$head(tags$link(rel = "shortcut icon", href = "fav.png")),
  useShinyjs(),
  useShinyalert(),
  tags$head(HTML("<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src='https://www.googletagmanager.com/gtag/js?id=UA-124289947-4'></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'UA-124289947-4');
</script>

")),
  uiOutput("page"),
  fluidRow(
    id = "main_page_contents",
    tags$img(id = "header_main_page", src = "iTUPA.png", width = "100%"),
    fluidRow(
      id = "main_contents",
      tags$head(tags$style(type="text/css", "body {max-width: 1000px; text-align: center;
                           margin: auto; padding: 5px 5px 20px 5px;}")),
      tags$head((tags$style(type="text/css", "#main_contents{box-shadow: 10px 10px 5px grey; border: 2px solid #73AD21; border-radius: 25px;
                          padding: 20px; margin: 10px 0px 0px 0px;}
                          .uploadSecion{ border: 2px solid #73AD21; border-radius: 25px;
                          padding: 0px; margin: 0px 0px 10px 0px;}"))),

      tags$h1("iTUPA: Topographic-Unit Parsimony Analysis"),
      tags$br(),

      column(id = "filesUploadSection", 12, class = "uploadSecion",
             column(6,
                    tags$h3("Upload map in shapefile format"),
                    fileInput("file_shp", "Main file: .shp file", accept = ".shp"),
                    fileInput("file_shx", "Index file: .shx file", accept = ".shx"),
                    fileInput("file_dbf", "dBASE table: .dbf file", accept = ".dbf")
             ),
             column(6,
                    tags$h3("Upload Endemism file"),
                    fileInput("file_csv", "", accept = ".csv"),
                    tags$h3("Process Input Files"),
                    actionButton("process_input_main_page", "Process"),
                    hidden(column(id="pBarColumn", 12,
                                  tags$br(),
                                  progressBar(id = "pBar", value = 0, total = 100, title = "", display_pct = TRUE),
                                  tags$br()
                    ))

             )),

      tags$head(tags$style("#result{color: green;
                                        font-size: 20px;
                         font-style: italic;
                         padding: 5px 0px;
                         }
                         #note{color: red;
                         padding: 12px 0px !important;}
                        .form-group {margin: auto;}
                        #mapDiv{margin-bottom: 10px;}
                        #googleMapOutput{margin-bottom: 10px;}
                         ")),


      tags$head(tags$style(type="text/css", "p {font-size: 16px;} h2{text-decoration: underline;}
                                .example{border: 1px solid #000; border-radius: 25px; padding: 10px; background-color: #eee;
                                font-family: 'Courier New', Courier, 'Lucida Sans Typewriter', 'Lucida Typewriter', monospace;}")),

      tags$h2("Tutorial"),
      tags$div(HTML("The Brazilian Atlantic Forest regionalization in shapefile map along with the endemism data from
                          <a href='http://www.publish.csiro.au/sb/SB16057' target='_blank'>Amorim and Santos (2017)</a>
                          are available
                         <a href='iTUPA example.zip' download>here</a>.<br /><br />")),
      tags$p(HTML("Example of the Endemism input file:<br />
                        <div class='example'>id , species , latitude , longitude<br />
                                          0,Elephantomyia  juquiensis , -24.319196 ,  -47.635061<br />
                                          1,Elephantomyia  primogenia ,  -22.416960 ,  -42.975602<br />
                                          2,Elephantomyia  corniculata ,  -21.2,  -47.15<br />
                                          3,Elephantomyia  vesca ,  -24.308775 ,  -48.273590<br />
                                          4,Olbiogaster  erythrohydrus ,  -15.743519 ,  -41.457510<br />
                                          5,Olbiogaster  midas ,  -22.223561 ,  -54.812549<br />
                                          6,Olbiogaster  marinonii ,  -23.436152 ,  -50.250055<br />
                                          6,Olbiogaster  marinonii ,  -23.916888 ,  -51.981893<br />
                                          7,Olbiogaster  pirapo ,  -26.855267 ,  -55.541359
                        </div>
                       ")),
      tags$br(),
      tags$br(),
      tags$p(HTML("Shapefile map specifications:<br />
                              <div class='example'>The map must be composed of closed regions without self-intersections.
                                    Specifically, each region is an independent closed polygonal curve.<br /><br />
                                A region can have any number of inner (closed) regions.<br /><br />
                      Multiple regions can have the same label; but if they are children, they must belong to the same mother region;<br /><br />
                      Regions labels must end with letters.
                      </div>
                      ")),

      tags$h2("Privacy Policy"),
      tags$p(HTML("iTUPA does not store the user's input/output data after closing the browser's tab.")),
      tags$br(),
      tags$a(href="mailto:muhsen.hammoud84@gmail.com", "Contact Us")
    ),
    fluidRow(
      id = "footer",
      tags$br(),
      tags$br(),
      tags$div(id = "copyright",
               HTML(paste0("@ ", format(Sys.Date(), "%Y"),
                           " <a href='http://www.ufabc.edu.br/' target='_blank'>Federal University of ABC</a>")))
    )
  ),

  hidden(
    fluidRow(
      id = "results_page_contents",
      fluidRow(
        style = "background-color: #74ad21; margin: 5px; border-radius: 15px;",
        column(1,
               tags$a(tags$img(id = "logo", src = "logo.png", style = "width: 100px; padding: 10px 0px;"),
                      href="javascript:history.go(0)")),
        column(11)
      ),

      fluidRow(
        id = "contents_section",
        tags$head((tags$style(type="text/css", "#contents_section{margin: 0px !important;}
        #side_bar, #map_section, #tu_tree_section, #tu_table_section, #species_table_section
                        {border: 2px solid #73AD21; border-radius: 15px;
                          padding: 10px; margin: 10px 0px 0px 0px;}
                          "))),
        column(2,
               id = "side_bar",
               tags$div(id = "downloadFrase", "Download:"),
               tags$br(),
               downloadButton("downloadDataSS", "MRP-matrix.ss"),
               tags$br(),
               downloadButton("downloadDataNEX", "MRP-matrix.nex"),
               tags$br(),
               downloadButton("downloadTUTree", "TU Tree"),
               tags$br(),
               downloadButton("downloadPointsOut", "Points Out of the Map"),
               tags$h2("Map Controls"),
               checkboxInput("showMarkers", "Show species", TRUE),
               checkboxInput("showMap", "Show shapefile map", TRUE),
               colourInput("color_and_transparency", "Select shapefile map color and transparency", "#00FF0080", allowTransparent = TRUE),
               actionButton("rePlot", "Apply"),
               tags$br(),
               actionButton("reGenerateTree", "Re-Generate TU Tree")

        ),
        column(10,
               fluidRow(
                 column(6,
                        id = "map_section",
                        column(id = "googleMapOutput", 12, google_mapOutput("myMap", height = "500px") %>% withSpinner())
                 ),

                 column(6,
                        id = "tu_tree_section",
                        fluidRow(
                          id = "main_contents_vis",
                          style = "margin: 0px;",
                          tags$div(HTML(paste0("
                            <div id = 'container_tree_viz'>
                                <div class = 'row'>
                                    <div class = 'col-md-12'>
                                        <div class='btn-toolbar' role='toolbar' style='justify-content: flex-end;'>
                                            <div class='btn-group' style='max-height: 30px;'>
                                                <button type='button' class='btn btn-default btn-sm' data-direction = 'vertical' data-amount = '1' title = 'Expand vertical spacing'>
                                                <i class='fas fa-arrows-alt-v' ></i>
                                                </button>
                                                <button type='button' class='btn btn-default btn-sm' data-direction = 'vertical' data-amount = '-1' title = 'Compress vertical spacing'>
                                                <i class='fa  fa-compress fa-rotate-135' ></i>
                                                </button>
                                                <button type='button' class='btn btn-default btn-sm' data-direction = 'horizontal' data-amount = '1' title = 'Expand horizonal spacing'>
                                                <i class='fas fa-arrows-alt-h' ></i>
                                                </button>
                                                <button type='button' class='btn btn-default btn-sm' data-direction = 'horizontal' data-amount = '-1' title = 'Compress horizonal spacing'>
                                                <i class='fa  fa-compress fa-rotate-45' ></i>
                                                </button>
                                                <button type='button' class='btn btn-default btn-sm' id = 'sort_ascending' title = 'Sort deepest clades to the bottom'>
                                                <i class='fa fa-sort-amount-asc' ></i>
                                                </button>
                                                <button type='button' class='btn btn-default btn-sm' id = 'sort_descending' title = 'Sort deepest clades to the top'>
                                                <i class='fa fa-sort-amount-desc' ></i>
                                                </button>
                                                <button type='button' class='btn btn-default btn-sm' id = 'sort_original' title = 'Restore original order'>
                                                <i class='fa fa-sort' ></i>
                                                </button>
                                            </div>
                                            <div class='btn-group' data-toggle='buttons'>
                                                <label class='btn btn-default active btn-sm'>
                                                <input type='radio' name='options' class = 'phylotree-layout-mode' data-mode = 'linear' autocomplete='off' checked title = 'Layout linearly'> Linear
                                                </label>
                                                <label class='btn btn-default  btn-sm'>
                                                <input type='radio' name='options' class = 'phylotree-layout-mode' data-mode = 'radial' autocomplete='off' title = 'Layout radially'> Radial
                                                </label>
                                            </div>
                                            <!--<div class='btn-group' style='max-height: 30px;'>
                                                <button type='button' class='btn btn-default btn-sm active' id = 'toggle_animation' title = 'Toggle animation'>
                                                    Animation
                                                </button>
                                                </label>
                                                </div>-->
                                            <!--<div class='btn-group' data-toggle='buttons'>
                                                <label class='btn btn-default active btn-sm'>
                                                <input type='radio' class = 'phylotree-align-toggler' data-align = 'left' name='options-align' autocomplete='off' checked title = 'Align tips labels to branches'>
                                                <i class='fa fa-align-left' ></i>
                                                </input>
                                                </label>
                                                <label class='btn btn-default btn-sm'>
                                                <input type='radio' class = 'phylotree-align-toggler' data-align = 'right' name='options-align' autocomplete='off' title = 'Align tips labels to the edge of the plot'>
                                                <i class='fa fa-align-right' ></i>
                                                </input>
                                                </label>
                                            </div>-->
                                            <button type='button' id='clear_selection' class='btn btn-default btn-sm' title = 'Clear selection'>
                                            <i class='fa fa-eraser' ></i>
                                            </button>
                                            <div class='btn-group' style='max-height: 30px;'>
                                                <button type='button' class='btn btn-default btn-sm' title = 'Save' onclick='saveSvg()' title = 'Download'>
                                                <i class='fa fa-download'></i>
                                                </button>
                                            </div>
                                            <!--<div class='btn-group' style='max-height: 30px;'>
                                                <button type='button' class='btn btn-default btn-sm' id = 'toggle_annotation' title = 'Annotations Control'>
                                                Annotations
                                                </button>
                                            </div>-->
                                        </div>
                                        <div id='annotations_control_tree' class = 'row' style='text-align: left; margin-left: 0px; display: none;'>
                                            <div id='all_tree' class='row'>
                                                <div class='col-md-2'><strong>All: </strong></div>
                                                <div class='col-md-10'>
                                                    <div class='btn-group' style='max-height: 30px;'>
                                                        <button type='button' id='editing_points' class='btn btn-default btn-sm active' title = 'Allow editing'>
                                                        <i class='fa fa-edit'></i>
                                                        </button>
                                                    </div>
                                                    <div class='btn-group' style='max-height: 30px;'>
                                                        <!--<button id='annotations_color_change_tree' title='Change all annotations color' data-jscolor='{value:'#FFFFFF', alpha:0.4, onInput: 'change_annotations_color(this)'}'></button>-->
                                                        <input onInput='change_annotations_color(this.jscolor)'  data-jscolor='{value: '00FF00', alpha:0.7}'>
                                                    </div>
                                                    <div class='btn-group' style='max-height: 30px;'>
                                                        <button type='button' class='btn btn-default btn-sm' title = 'Put annotations in front of/behind the tree' onclick='reorder_svg_annotations()'>
                                                        Reorder
                                                        </button>
                                                    </div>
                                                    <div class='btn-group' style='max-height: 30px;'>
                                                        <button type='button' class='btn btn-default btn-sm' title = 'Trash all annotations' onclick='trash_all()'>
                                                        <i class='fa fa-trash-o'></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div id='rect_tree' class='row'>
                                                <div class='col-md-2'><strong>Rectangle: </strong></div>
                                                <div class='col-md-10'>
                                                    <div class='btn-group' style='max-height: 30px;'>
                                                        <button type='button' class='btn btn-default btn-sm' title = 'Add new rectangle' onclick='add_new_rectangle()'>
                                                        <i class='fa fa-plus'></i>
                                                        </button>
                                                    </div>
                                                    <div class='btn-group' style='max-height: 30px;'>
                                                        <!--<button id='rectangle_color_change_tree' title='Change rectangle's color' data-jscolor='{value:'#FFFFFF', alpha:0.4, onInput: 'change_rectangle_color(this)'}'></button>-->
                                                        <input onInput='change_rectangle_color(this.jscolor)'  data-jscolor='{value: '00FF00', alpha:0.7}'>
                                                    </div>
                                                    <div class='btn-group' style='max-height: 30px;'>
                                                        <button type='button' class='btn btn-default btn-sm' title = 'Trash rectangle' onclick='trash_rectangle()'>
                                                        <i class='fa fa-trash-o'></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div id='arc_tree' class='row'>
                                                <div class='col-md-2'><strong>Arc: </strong></div>
                                                <div class='col-md-10'>
                                                    <div class='btn-group' style='max-height: 30px;'>
                                                        <button type='button' class='btn btn-default btn-sm' title = 'Add New Arc' onclick='add_new_arc()'>
                                                        <i class='fa fa-plus'></i>
                                                        </button>
                                                    </div>
                                                    <div class='btn-group' style='max-height: 30px;'>
                                                        <!--<button id='arc_color_change_tree' title='Change arc's color' data-jscolor='{value:'#FFFFFF', alpha:0.4, onInput: 'change_arc_color(this)'}'></button>-->
                                                        <input onInput='change_arc_color(this.jscolor)'  data-jscolor='{value: '00FF00', alpha:0.7}'>
                                                    </div>
                                                    <div class='btn-group' style='max-height: 30px;'>
                                                        <button type='button' class='btn btn-default btn-sm' title = 'Trash arc' onclick='trash_arc()'>
                                                        <i class='fa fa-trash-o'></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div id='text_tree' class='row'>
                                                <div class='col-md-2'><strong>Text: </strong></div>
                                                <div class='col-md-10' style='padding-right: 30px;'>
                                                    <div class='btn-group' style='max-height: 30px;'>
                                                        <button type='button' class='btn btn-default btn-sm' title = 'Add New Text' onclick='add_new_text()'>
                                                        <i class='fa fa-plus'></i>
                                                        </button>
                                                    </div>
                                                    <div class='btn-group' style='max-height: 30px;'>
                                                        <!--<button id='text_color_change_tree' title='Change text's color' data-jscolor='{value:'#FFFFFF', alpha:0.4, onInput: 'change_text_color(this)'}'></button>-->
                                                        <input onInput='change_text_color(this.jscolor)'  data-jscolor='{value: '000000', alpha:1}'>
                                                    </div>
                                                    <div class='btn-group' style='max-height: 30px;'>
                                                        <input id='text_annotation_contents_tree' title='Text element's contents' type='text' value='Text'>
                                                    </div>
                                                    <div class='btn-group' style='max-height: 30px;'>
                                                        <input id='myFontPicker_tree' type='text'>
                                                    </div>
                                                    <div class='btn-group' style='max-height: 30px;'>
                                                        <input type='number' id='font_size_tree' title='Change font size' name='font_size' min='6' max='72' value='12' oninput='change_font_size()'>
                                                    </div>
                                                    <div class='btn-group' style='max-height: 30px;'>
                                                        <button type='button' class='btn btn-default btn-sm' title = 'Trash text' onclick='trash_text()'>
                                                        <i class='fa fa-trash-o'></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>")),
                                   uiOutput("tu_tree_vis") %>% withSpinner(),

                                HTML("
                            </div>")
                              )
                          )
                 )
               ),
               fluidRow(
                 column(6,
                        id = "tu_table_section", style = "overflow: scroll; height: 500px;",
                        tags$h3("Topographic Units list"),
                        DT::dataTableOutput("tu_table") %>% withSpinner()
                 ),

                 column(6,
                        id = "species_table_section", style = "overflow: scroll; height: 500px;",
                        tags$h3("Species list"),
                        DT::dataTableOutput("species_table") %>% withSpinner()
                 )
               )
        )

      ),
      fluidRow(
        id = "footer",
        tags$br(),
        tags$br(),
        tags$div(id = "copyright",
                 HTML(paste0("@ ", format(Sys.Date(), "%Y"),
                             " <a href='http://www.ufabc.edu.br/' target='_blank'>Federal University of ABC</a>")))
      )
    )
  ),
  tags$script(src = "myscript.js"),
  tags$head(HTML(
    " <meta charset='utf-8'>
    <!-- Latest compiled and minified CSS -->
    <!--<script src='http://code.jquery.com/jquery.js'></script>-->
    <script src='https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min.js'></script>


    <link rel='stylesheet' href='http://netdna.bootstrapcdn.com/bootstrap/3.0.0/css/bootstrap.min.css'>
    <link href='http://netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css' rel='stylesheet'>

    <!-- Optional theme -->
    <link rel='stylesheet' href='http://netdna.bootstrapcdn.com/bootstrap/3.0.0/css/bootstrap-theme.min.css'>

    <!-- Latest compiled and minified JavaScript -->
    <!--<script src='http://netdna.bootstrapcdn.com/bootstrap/3.0.0/js/bootstrap.min.js'></script>-->

    <!-- <meta name='viewport' content='width=device-width, initial-scale=1.0'>-->

    <script src='http://d3js.org/d3.v3.min.js'></script>
    <script src='phylotree.js'></script>
    <script src='jscolor.js'></script>

    <link href='jquery.fontpicker.css' rel='stylesheet' />
    <script src='jquery.fontpicker.js'></script>

    <link href='phylotree.css' rel='stylesheet'>

    <style>

    .fa-rotate-45 {
    -webkit-transform: rotate(45deg);
    -moz-transform: rotate(45deg);
    -ms-transform: rotate(45deg);
    -o-transform: rotate(45deg);
    transform: rotate(45deg);
    }

    .fa-rotate-135 {
    -webkit-transform: rotate(135deg);
    -moz-transform: rotate(135deg);
    -ms-transform: rotate(135deg);
    -o-transform: rotate(135deg);
    transform: rotate(135deg);
    }


    #tree_tooltip {
    color: #fff;
    position: absolute;
    padding: 20px;
    max-width: 200px;

    /* need i.e. rule */
    background-color: rgba(0, 0, 0, 0.85);
    -webkit-border-radius: 12px;
    -moz-border-radius: 12px;
    border-radius: 12px;
    display: none;
    }

    #main_display{
    width: 100% !important;
    }


    body{
    margin: auto !important;
    }

    .modal-dialog{
      left: 0px !important;
    }

    .edit_circle_shown{
    display: block;
    }

    .edit_circle_hidden{
        display: none;
    }

    h3{
    margin-top: 0px;
    }

    </style>"
  ))
)



server <- function(input, output, session) {

  server_path <- if (dir.exists("/Users/muhsen/Google Drive/PhD Brazil/Research/map/itupa/")) "/Users/muhsen/Google Drive/PhD Brazil/Research/map/itupa/" else "/srv/shiny-server/itupa/"
  #server_path <- "/Users/muhsen/Desktop/map/itupa/"
  #server_path <- "/srv/shiny-server/itupa/"

  ## You'll need a Google Map API key to run this code
  mapKey <- ""

  upload_dir <- ""
  shp_file_name <- ""
  shx_file_name <- ""
  dbf_file_name <- ""
  csv_file_name <- ""
  nc <- ""
  enc <- ""
  d <- ""
  sf_wkt <- ""
  files_processed <- FALSE

  inputPhyloData <- ""
  inputMap <- ""

  matrix_res_ss <- ""
  matrix_res_nex <- ""
  pointsOutOfMap <- "id,species,latitude,longitude\n"
  TU_tree <- ""
  data <- ""

  map_id <- "myMap"

  proxy_tu_table = dataTableProxy('tu_table')
  proxy_species_table = dataTableProxy('species_table')


  # observe({
  #   # output$page <- renderUI({
  #   #
  #   #
  #   # })
  # })



  observeEvent(input$process_input_main_page,{
    if(is.null(input$file_shp) | is.null(input$file_shx) | is.null(input$file_dbf) | is.null(input$file_csv)){
      shinyalert("Oops!", "Please choose the 4 required files.", type = "error")
    }

    req(input$file_shp)
    req(input$file_shx)
    req(input$file_dbf)
    req(input$file_csv)

    showModal(dataModal(failed = TRUE))

  }, ignoreInit = TRUE)



  observeEvent(input$ok,{

    if(!is.numeric(input$maxit) | !is.numeric(input$k)){
      shinyalert("Oops!", "Please provide valid values for: Maximum iterations number and k.", type = "error")
    }

    req(input$maxit)
    req(input$k)

    library(lubridate)
    library(raster)
    library(pracma)
    library(stringr)
    library(ape)
    library(purrr)
    library(phangorn)
    library(textclean)
    library(data.table)
    library(tools)
    library(utils)
    library(sp)
    library(sf)


    while(dir.exists(paste0(server_path, "www/", ID <- paste0(format(Sys.time(), "%Y%m%d%H%M%S"), sample(100000:999999, 1))))){}

    dir.create(upload_dir <<- paste0(server_path, "www/", ID))

    shp_file_name <<- input$file_shp$name
    shx_file_name <<- input$file_shx$name
    dbf_file_name <<- input$file_dbf$name
    csv_file_name <<- input$file_csv$name

    file.copy(input$file_shp$datapath, file.path(upload_dir, shp_file_name))
    file.copy(input$file_shx$datapath, file.path(upload_dir, shx_file_name))
    file.copy(input$file_dbf$datapath, file.path(upload_dir, dbf_file_name))
    file.copy(input$file_csv$datapath, file.path(upload_dir, csv_file_name))

    disable("process_input_main_page")
    removeModal()

    ################################
    # Prepare the map to be plotted
    nc <<- sf::st_read(paste0(upload_dir, "/", shp_file_name))
    nc[["species_no"]] <<- 0

    inputPhyloData <- read.csv(file=paste0(upload_dir, "/", csv_file_name), header=TRUE, sep=",")
    id <- list(as.character(read.csv(file=paste0(upload_dir, "/", csv_file_name), header=TRUE, sep=",")$id))
    species <- list(as.character(read.csv(file=paste0(upload_dir, "/", csv_file_name), header=TRUE, sep=",")$species))
    idForMap <- read.csv(file=paste0(upload_dir, "/", csv_file_name), header=TRUE, sep=",")$id
    lat <- read.csv(file=paste0(upload_dir, "/", csv_file_name), header=TRUE, sep=",")$latitude
    lon <- read.csv(file=paste0(upload_dir, "/", csv_file_name), header=TRUE, sep=",")$longitude
    speciesForMap <- read.csv(file=paste0(upload_dir, "/", csv_file_name), header=TRUE, sep=",")$species
    d <<- data.frame("id" = as.character(idForMap), "lat" = as.character(lat), "lon" = as.character(lon),
                     "species" = as.character(speciesForMap), "ID" = seq.int(from = 0, to = (lengths(id)-1)))
    d$region <<- ""
    #######################################


    originalMap <- shapefile(paste0(upload_dir, "/", shp_file_name))
    shinyjs::logjs(originalMap)
    inputPhyloData <- read.csv(file=paste0(upload_dir, "/", csv_file_name), header=TRUE, sep=",", stringsAsFactors = FALSE)
    inputPhyloData <- cbind(inputPhyloData, TU = "na", stringsAsFactors = FALSE)
    pointsOutOfMapFlag <- FALSE

    shinyjs::show("pBarColumn")
    progressCounter <- 0

    for (species_id in 1 : length(inputPhyloData$id)){
      reg_counter <- 0
      min_area <- 0
      reg_name <- "na"
      reg_id <- -1
      for (reg in 1 : length(originalMap@polygons)){
        lat <- originalMap@polygons[[reg]]@Polygons[[1]]@coords[,c(1)]
        lon <- originalMap@polygons[[reg]]@Polygons[[1]]@coords[,c(2)]

        if(point.in.polygon(inputPhyloData$latitude[species_id], inputPhyloData$longitude[species_id], lon,lat) == 1){
          #print(inputPhyloData$id[species_id])
          reg_counter <- reg_counter + 1
          #print(originalMap1$NAME[reg])
          if(reg_counter == 1){
            min_area <- originalMap@polygons[[reg]]@area
            reg_name <- originalMap$NAME[reg]
            reg_id <- reg
            print(paste(min_area, reg_name, inputPhyloData$species[species_id], inputPhyloData$latitude[species_id],
                        inputPhyloData$longitude[species_id], sep = ";"))
          }else if(originalMap@polygons[[reg]]@area < min_area){
            min_area <- originalMap@polygons[[reg]]@area
            reg_name <- originalMap$NAME[reg]
            reg_id <- reg
            print(paste(min_area, reg_name, inputPhyloData$species[species_id], inputPhyloData$latitude[species_id],
                        inputPhyloData$longitude[species_id], sep = ";"))
          }
        }
      }
      print(reg_counter)
      print(paste(min_area, reg_name, inputPhyloData$species[species_id], sep = ";"))
      if(reg_counter == 0){
        print(inputPhyloData$species[species_id])
        pointsOutOfMapFlag <- TRUE
        pointsOutOfMap <<- paste0(pointsOutOfMap, inputPhyloData$id[species_id], ",", inputPhyloData$species[species_id], ",",
                                  inputPhyloData$latitude[species_id], ",", inputPhyloData$longitude[species_id], "\n")
      }

      if(reg_id != -1){
        nc[["species_no"]][reg_id] <<- nc[["species_no"]][reg_id] + 1
      }

      print("##################################")
      inputPhyloData$TU[[species_id]] <- reg_name
      d$region[[species_id]] <<- reg_name

      progressCounter <- progressCounter + 1
      updateProgressBar(session = session, id = "pBar",
                        value = progressCounter, total = length(inputPhyloData$id),
                        title = "Matching species to TUs"
      )
    }


    nameRegions <- originalMap[["NAME"]]
    uniqueNameRegion <- sort(unique(nameRegions))
    #uniqueNameRegion <- sort(uniqueNameRegion)

    uniqueNameSpecies <- sort(unique(str_trim(inputPhyloData$species)))
    #uniqueNameSpecies <- sort(uniqueNameSpecies)

    M <- matrix(0, length(uniqueNameRegion),length(uniqueNameSpecies), dimnames=list(uniqueNameRegion))
    colnames(M) <- uniqueNameSpecies


    for (species_id in 1 : length(inputPhyloData$id)){
      if (inputPhyloData$TU[species_id] != "na"){
        M[inputPhyloData$TU[species_id], str_trim(inputPhyloData$species[species_id])] <- 1
      }
    }


    ## remove non-informative species
    while(TRUE){
      one_deleted <- FALSE
      length_species <- length(uniqueNameSpecies)
      for(spe in 1:length_species){
        if(sum(as.logical(M[,spe])) <= 1){
          M <- M[,-spe]
          uniqueNameSpecies <- uniqueNameSpecies[-spe]
          one_deleted <- TRUE
          break
        }
      }

      if(one_deleted == FALSE){
        break
      }
    }

    ## remove non-informative regions
    while(TRUE){
      one_deleted <- FALSE
      length_regions <- length(uniqueNameRegion)
      for(reg in 1:length_regions){
        if(sum(M[reg,]) == 0){
          M <- M[-reg,]
          uniqueNameRegion <- uniqueNameRegion[-reg]
          one_deleted <- TRUE
          break
        }
      }

      if(one_deleted == FALSE){
        break
      }
    }


    matrix_res_ss <<- paste0("xread\n\'\'",length(uniqueNameSpecies), "\t", length(uniqueNameRegion), "\n\n")
    matrix_res_nex <<- paste0("#NEXUS\n\nBEGIN DATA;\n\nDIMENSIONS  NTAX=",length(uniqueNameSpecies), " NCHAR=",
                              length(uniqueNameRegion),";","\n\nFORMAT MISSING=? GAP=-;\n\nMATRIX\n\n")

    for(reg in 1:length(uniqueNameRegion)){
      line_matrix <- ""
      for(species_value in 1:length(M[reg,])){
        line_matrix <- paste0(line_matrix, as.numeric(as.logical(M[reg, species_value])))
      }
      matrix_res_ss <<- paste0(matrix_res_ss, uniqueNameRegion[reg], "X \t", line_matrix, "\n")
      matrix_res_nex <<- paste0(matrix_res_nex, uniqueNameRegion[reg], "X \t", line_matrix, "\n")
    }

    matrix_res_ss <<- paste0(matrix_res_ss,";")
    matrix_res_nex <<- paste0(matrix_res_nex,";\nEND;")


    # compute contrast matrix for phangorn
    contrast<-matrix(data=c(1,0,0,1,1,1),3,2,dimnames=list(c("0","1","?"),c("0","1")),byrow=TRUE)
    # convert XX to phyDat object
    XX<-phyDat(M,type="USER",contrast=contrast)

    #############################
    # Fitch
    #############################

    data <<- XX
    start <- NULL
    method <- "fitch"
    maxit <- input$maxit
    k <- input$k
    trace <- 1
    all <- TRUE
    rearrangements <- "SPR"
    perturbation <- "ratchet"
    string_res <- ""

    eps <- 1e-08
    #    if(method=="fitch" && (is.null(attr(data, "compressed")) || attr(data, "compressed") == FALSE))
    #       data <- compressSites(data)
    trace <- trace - 1
    uniquetree <- function(trees) {
      k <- 1
      res <- trees[[1]]
      result <- list()
      result[[1]] <- res
      k <- 2
      trees <- trees[-1]
      while (length(trees) > 0) {
        # test and replace
        # change RF to do this faster RF.dist(res, trees) class(tree) = "multiPhylo"
        #            rf2 = RF.dist(res, trees, FALSE)
        rf <- sapply(trees, RF.dist, res, FALSE)
        if(any(rf==0))trees <- trees[-which(rf == 0)]
        if (length(trees) > 0) {
          res <- trees[[1]]
          result[[k]] <- res
          k <- k+1
          trees <- trees[-1]
        }
      }
      result
    }
    if (is.null(start))
      start <- optim.parsimony(nj(dist.hamming(data)), data, trace = trace,
                               method=method, rearrangements=rearrangements)
    tree <- start
    data <- subset(data, tree$tip.label)
    attr(tree, "pscore") <- parsimony(tree, data, method=method)
    mp <- attr(tree, "pscore")
    if (trace >= 0) {
      string_res <- paste(string_res, "\nBest pscore so far:",attr(tree, "pscore"))
    }

    FUN <- function(data, tree, method, rearrangements, ...)
      optim.parsimony(tree, data = data, method=method,
                      rearrangements=rearrangements)
    result <- list()
    result[[1]] <- tree
    kmax <- 1
    nTips <- length(tree$tip.label)

    progressCounter <- 0

    for (i in 1:maxit) {
      progressCounter <- progressCounter + 1
      updateProgressBar(session = session, id = "pBar",
                        value = progressCounter, total = maxit,
                        title = "Performing the parsimony analysis"
      )

      if(perturbation=="ratchet"){
        bstrees <- bootstrap.phyDat(data, FUN, tree=tree, bs=1,
                                    trace=trace, method=method, rearrangements=rearrangements)
        trees <- lapply(bstrees, optim.parsimony, data, trace = trace,
                        method=method, rearrangements=rearrangements)
      }
      if(perturbation=="stochastic"){
        treeNNI <- rNNI(tree, floor(nTips/2))
        trees <- optim.parsimony(treeNNI, data, trace = trace,
                                 method = method, rearrangements = rearrangements)
        trees <- list(trees)
      }
      if(inherits(result,"phylo")) m <- 1
      else m <- length(result)
      if(m>0) trees[2 : (1+m)] <- result[1:m]
      pscores <- sapply(trees, function(data) attr(data, "pscore"))
      mp1 <- min(pscores)
      if((mp1+eps) < mp) kmax <- 1
      else kmax <- kmax+1
      mp <- mp1

      if (trace >= 0)
        string_res <- paste(string_res, "\nBest pscore so far:",mp)
      ind <- which(pscores < mp + eps)
      if (length(ind) == 1) {
        result <- trees[ind]
        tree <- result[[1]]
      }
      else {
        result <- uniquetree(trees[ind])
        l <- length(result)
        tree <- result[[sample(l, 1)]]
      }
      if(kmax == k) break()
    }# for

    #if(!all) return(tree)
    if(length(result)==1) print(result[[1]])
    class(result) <- "multiPhylo"
    #print(result)
    #write.nexus(result, file="MyNexusTreefile.nex")

    res_con <- consensus(result, p = 1, check.labels = TRUE)

    tree<-reorder.phylo(res_con,"cladewise")
    n<-length(tree$tip)
    string<-vector(); string[1]<-"("; j<-2
    for(i in 1:nrow(tree$edge)){
      if(tree$edge[i,2]<=n){
        string[j]<-tree$tip.label[tree$edge[i,2]]; j<-j+1
        if(!is.null(tree$edge.length)){
          string[j]<-paste(c(":",round(tree$edge.length[i],10)), collapse="")
          j<-j+1
        }
        v<-which(tree$edge[,1]==tree$edge[i,1]); k<-i
        while(length(v)>0&&k==v[length(v)]){
          string[j]<-")"; j<-j+1
          w<-which(tree$edge[,2]==tree$edge[k,1])
          if(!is.null(tree$edge.length)){
            string[j]<-paste(c(":",round(tree$edge.length[w],10)), collapse="")
            j<-j+1
          }
          v<-which(tree$edge[,1]==tree$edge[w,1]); k<-w
        }
        string[j]<-","; j<-j+1
      } else if(tree$edge[i,2]>=n){
        string[j]<-"("; j<-j+1
      }
    }


    if (is.null(tree$edge.length)){
      string<-c(string[1:(length(string)-1)], ";")
    } else {
      string<-c(string[1:(length(string)-2)],";")
    }

    TU_tree <<- paste(string,collapse="")

    ###########################################################
    ## Change main page width

    output$page <- renderUI({
      tags$head(tags$style(type="text/css", "body {max-width: 100% !important; width: 100%; text-align: center;
                           margin: auto; padding: 5px 5px 20px 5px;}"))
    })

    ##########################################################


    if (pointsOutOfMapFlag){
      shinyjs::show("downloadPointsOut")
    }

    hide("main_page_contents")

    shinyjs::show("results_page_contents")

    color_and_transparency <- input$color_and_transparency
    shinyjs::show("mapDiv")
    shinyjs::show("googleMapOutput")

    ##################################################
    # visualizing TU tree

    output$tu_tree_vis <- renderUI({
      fluidRow(
        tags$div(HTML(paste0("

                <div class = 'row' style ='margin: 0px;'>
                    <div class = 'col-md-12'>
                        <div id='tree_viz_wrapper' class = 'col-md-12' style='overflow: scroll; height: 480px;'>
                            <div id = 'tree_container' class = 'tree-widget'>
                            </div>
                        </div>
                    </div>
                </div>

            <script>
            let TU_tree = \"", TU_tree,"\";
            var width  = 800,
            height = 600,
            selection_set = ['Foreground'],
            current_selection_name = $(\"#selection_name_box\").val(),
            current_selection_id = 0,
            max_selections       = 10;
            color_scheme = d3.scale.category10(),
            selection_menu_element_action = \"phylotree_menu_element_action\";

            var tree = d3.layout.phylotree(\"body\")
            .size([height, width])
            .separation (function (a,b) {return 0;})
            .count_handler (function (count) {
             $(\"#selected_branch_counter\").text (function (d) {return count[current_selection_name];});
             $(\"#selected_filtered_counter\").text (count.tag);
            }
            );

            var container_tree_id = '#tree_container';

            var svg_tree = d3.select(container_tree_id).append(\"svg\")
            .attr(\"width\", width)
            .attr(\"height\", height);

            init_viz(TU_tree);



            </script>

                             ")

        ))
      )
    })


    output$myMap <- renderGoogle_map({
      shinyjs::logjs(d)

      nc[["fill_color"]] <<- substr(color_and_transparency, 0, 7)
      if(nchar(color_and_transparency) == 9){
        nc[["fill_opacity"]] <<- as.numeric(strtoi(paste0("0x", substr(color_and_transparency, 8, 9))))/as.numeric(strtoi("0xFF"))
      }else{
        nc[["fill_opacity"]] <<- 1
      }

      shinyjs::logjs(nc)
      enc <<- encode(nc)
      encLite <- encode(nc, strip = T)
      wkt <- polyline_wkt(enc)
      enc2 <- wkt_polyline(wkt)
      st_as_sfc(wkt$geometry)
      sf_wkt <<- as.data.frame(wkt)
      sf_wkt$geometry <- st_as_sfc(sf_wkt$geometry)
      sf_wkt <- st_sf(sf_wkt)

      head(sf_wkt[, c("NAME", "ENTITYHAND", "geometry")])
      enc[1, 'geometry'][[1]] == enc2[1, 'geometry'][[1]]
      print(nc)

      google_map(key = mapKey, zoom = 1, event_return_type = "list") %>%
        add_markers(data = d, lat = "lat", lon = "lon", id = "ID", info_window = "species", close_info_window = TRUE) %>%
        add_polygons(data = nc, id = "NAME", polyline = attr(enc, "encoded_column"), fill_colour = "fill_color",
                     fill_opacity = "fill_opacity", info_window = "NAME")
    })

    d[["elevation"]] <<- as.character(lapply(as.numeric(google_elevation(key = mapKey, df_locations = d,
                     simplify = TRUE)$results$elevation), round, 3))

    print(d)


    output$tu_table <- DT::renderDataTable({
      tu_table.data <- data.frame(
          "Name" = nc[["NAME"]],
          "Species No" = nc[["species_no"]]
        )

      DT::datatable(tu_table.data,
                    extensions = 'Scroller',
                    options = list(
                      deferRender = TRUE,
                      scrollY = 330,
                      scroller = TRUE
                    ))
    })


    output$species_table <- DT::renderDataTable({
      species_table.data <- data.frame(
        "ID" = d[["id"]],
        "Species" = d[["species"]],
        "TU" = d[["region"]],
        "Altitude" = d[["elevation"]]
        )

      DT::datatable(species_table.data,
                    extensions = 'Scroller',
                    options = list(
                      deferRender = TRUE,
                      scrollY = 330,
                      scroller = TRUE
                    ))
    })

  }, ignoreInit = TRUE)




  observeEvent(input$rePlot | input$showMarkers | input$showMap,
               {

                 showMarkers <- input$showMarkers
                 showMap <- input$showMap
                 color_and_transparency <- input$color_and_transparency


                 nc[["fill_color"]] <<- substr(color_and_transparency, 0, 7)
                 if(nchar(color_and_transparency) == 9){
                   nc[["fill_opacity"]] <<- as.numeric(strtoi(paste("0x", substr(color_and_transparency, 8, 9), sep = "")))/as.numeric(strtoi("0xFF"))
                 }else{
                   nc[["fill_opacity"]] <<- 1
                 }

                 head(sf_wkt[, c("NAME", "ENTITYHAND", "geometry")])


                 if(showMarkers && showMap){
                   shinyjs::enable("color_and_transparency")
                   shinyjs::enable("rePlot")
                   google_map_update(map_id = map_id) %>%
                     clear_markers() %>%
                     clear_polygons() %>%
                     add_markers(data = d, lat = "lat", lon = "lon", id = "ID", info_window = "species",
                                 close_info_window = TRUE, update_map_view = FALSE) %>%
                     add_polygons(data = nc, id = "NAME", polyline = attr(enc, "encoded_column"), fill_colour = "fill_color",
                                  fill_opacity = "fill_opacity", info_window = "NAME", update_map_view = FALSE)

                 }else if(showMarkers && !showMap){
                   shinyjs::disable("color_and_transparency")
                   shinyjs::disable("rePlot")
                   google_map_update(map_id = map_id, data = d) %>%
                     clear_markers() %>%
                     clear_polygons() %>%
                     add_markers(data = d, lat = "lat", lon = "lon", id = "ID", info_window = "species",
                                 close_info_window = TRUE, update_map_view = FALSE)

                 }else if(!showMarkers && showMap){
                   shinyjs::enable("color_and_transparency")
                   shinyjs::enable("rePlot")
                   google_map_update(map_id = map_id) %>%
                     clear_markers() %>%
                     clear_polygons() %>%
                     add_polygons(data = nc, id = "NAME", polyline = attr(enc, "encoded_column"), fill_colour = "fill_color",
                                  fill_opacity = "fill_opacity", info_window = "NAME", update_map_view = FALSE)

                 }else if(!showMarkers && !showMap){
                   shinyjs::disable("color_and_transparency")
                   shinyjs::disable("rePlot")
                   google_map_update(map_id = map_id) %>%
                     clear_markers() %>%
                     clear_polygons()
                 }

               }, ignoreInit = TRUE)




  observeEvent(input$reGenerateTree, {
    showModal(reGenerateTreeModal(failed = TRUE))
  }, ignoreInit = TRUE)

  observeEvent(input$ok_re,{

    shinyjs::disable("ok_re")
    #############################
    # Fitch
    #############################

    start <- NULL
    method <- "fitch"
    maxit <- input$maxit_re
    k <- input$k_re
    trace <- 1
    all <- TRUE
    rearrangements <- "SPR"
    perturbation <- "ratchet"
    string_res <- ""

    eps <- 1e-08
    #    if(method=="fitch" && (is.null(attr(data, "compressed")) || attr(data, "compressed") == FALSE))
    #       data <- compressSites(data)
    trace <- trace - 1
    uniquetree <- function(trees) {
      k <- 1
      res <- trees[[1]]
      result <- list()
      result[[1]] <- res
      k <- 2
      trees <- trees[-1]
      while (length(trees) > 0) {
        # test and replace
        # change RF to do this faster RF.dist(res, trees) class(tree) = "multiPhylo"
        #            rf2 = RF.dist(res, trees, FALSE)
        rf <- sapply(trees, RF.dist, res, FALSE)
        if(any(rf==0))trees <- trees[-which(rf == 0)]
        if (length(trees) > 0) {
          res <- trees[[1]]
          result[[k]] <- res
          k <- k+1
          trees <- trees[-1]
        }
      }
      result
    }
    if (is.null(start))
      start <- optim.parsimony(nj(dist.hamming(data)), data, trace = trace,
                               method=method, rearrangements=rearrangements)
    tree <- start
    data <- subset(data, tree$tip.label)
    attr(tree, "pscore") <- parsimony(tree, data, method=method)
    mp <- attr(tree, "pscore")
    if (trace >= 0) {
      string_res <- paste(string_res, "\nBest pscore so far:",attr(tree, "pscore"))
    }

    FUN <- function(data, tree, method, rearrangements, ...)
      optim.parsimony(tree, data = data, method=method,
                      rearrangements=rearrangements)
    result <- list()
    result[[1]] <- tree
    kmax <- 1
    nTips <- length(tree$tip.label)

    progressCounter <- 0

    for (i in 1:maxit) {
      progressCounter <- progressCounter + 1
      updateProgressBar(session = session, id = "pBar",
                        value = progressCounter, total = maxit,
                        title = "Performing the parsimony analysis"
      )

      if(perturbation=="ratchet"){
        bstrees <- bootstrap.phyDat(data, FUN, tree=tree, bs=1,
                                    trace=trace, method=method, rearrangements=rearrangements)
        trees <- lapply(bstrees, optim.parsimony, data, trace = trace,
                        method=method, rearrangements=rearrangements)
      }
      if(perturbation=="stochastic"){
        treeNNI <- rNNI(tree, floor(nTips/2))
        trees <- optim.parsimony(treeNNI, data, trace = trace,
                                 method = method, rearrangements = rearrangements)
        trees <- list(trees)
      }
      if(inherits(result,"phylo")) m <- 1
      else m <- length(result)
      if(m>0) trees[2 : (1+m)] <- result[1:m]
      pscores <- sapply(trees, function(data) attr(data, "pscore"))
      mp1 <- min(pscores)
      if((mp1+eps) < mp) kmax <- 1
      else kmax <- kmax+1
      mp <- mp1

      if (trace >= 0)
        string_res <- paste(string_res, "\nBest pscore so far:",mp)
      ind <- which(pscores < mp + eps)
      if (length(ind) == 1) {
        result <- trees[ind]
        tree <- result[[1]]
      }
      else {
        result <- uniquetree(trees[ind])
        l <- length(result)
        tree <- result[[sample(l, 1)]]
      }
      if(kmax == k) break()
    }# for

    #if(!all) return(tree)
    if(length(result)==1) print(result[[1]])
    class(result) <- "multiPhylo"
    #print(result)
    #write.nexus(result, file="MyNexusTreefile.nex")

    res_con <- consensus(result, p = 1, check.labels = TRUE)

    tree<-reorder.phylo(res_con,"cladewise")
    n<-length(tree$tip)
    string<-vector(); string[1]<-"("; j<-2
    for(i in 1:nrow(tree$edge)){
      if(tree$edge[i,2]<=n){
        string[j]<-tree$tip.label[tree$edge[i,2]]; j<-j+1
        if(!is.null(tree$edge.length)){
          string[j]<-paste(c(":",round(tree$edge.length[i],10)), collapse="")
          j<-j+1
        }
        v<-which(tree$edge[,1]==tree$edge[i,1]); k<-i
        while(length(v)>0&&k==v[length(v)]){
          string[j]<-")"; j<-j+1
          w<-which(tree$edge[,2]==tree$edge[k,1])
          if(!is.null(tree$edge.length)){
            string[j]<-paste(c(":",round(tree$edge.length[w],10)), collapse="")
            j<-j+1
          }
          v<-which(tree$edge[,1]==tree$edge[w,1]); k<-w
        }
        string[j]<-","; j<-j+1
      } else if(tree$edge[i,2]>=n){
        string[j]<-"("; j<-j+1
      }
    }


    if (is.null(tree$edge.length)){
      string<-c(string[1:(length(string)-1)], ";")
    } else {
      string<-c(string[1:(length(string)-2)],";")
    }

    TU_tree <<- paste(string,collapse="")

    removeModal()

    runjs(paste0("re_init_viz(\"", TU_tree, "\");"))

  }, ignoreInit = TRUE)


  onStop(function() unlink(upload_dir, recursive = TRUE, force = TRUE))

  # Return the UI for a modal dialog with data selection input. If 'failed' is
  # TRUE, then display a message that the previous value was invalid.
  dataModal <- function(failed = FALSE) {
    modalDialog(
      h4("The parsimony analysis will be based on the following parameters:"),
      span(HTML("<strong>Method:</strong> Fitch<br /><strong>Rearrangements:</strong> SPR<br /><strong>Perturbation:</strong> Ratchet<br /><br />")),
      numericInput("maxit", "Maximum iterations number:", 1000, min = 1, max = 10000),
      br(),
      numericInput("k", "k:", 3, min = 1, max = 10),
      #if (failed)
      #div(tags$b("Invalid name of data object", style = "color: red;")),

      footer = tagList(
        modalButton("Cancel"),
        actionButton("ok", "OK")
      )
    )
  }

  reGenerateTreeModal <- function(failed = FALSE) {
    modalDialog(
      h4("The parsimony analysis will be based on the following parameters:"),
      span(HTML("<strong>Method:</strong> Fitch<br /><strong>Rearrangements:</strong> SPR<br /><strong>Perturbation:</strong> Ratchet<br /><br />")),
      numericInput("maxit_re", "Maximum iterations number:", 1000, min = 1, max = 10000),
      br(),
      numericInput("k_re", "k:", 3, min = 1, max = 10),
      #if (failed)
      #div(tags$b("Invalid name of data object", style = "color: red;")),

      footer = tagList(
        modalButton("Cancel"),
        actionButton("ok_re", "OK")
      )
    )
  }

  output$downloadDataSS <- downloadHandler(
    filename = function() {
      "mrp_matrix.ss"
    },
    content = function(file) {
      write(matrix_res_ss,file)
    }
  )

  output$downloadDataNEX <- downloadHandler(
    filename = function() {
      "mrp_matrix.nex"
    },
    content = function(file) {
      write(matrix_res_nex,file)
    }
  )

  output$downloadPointsOut <- downloadHandler(
    filename = function() {
      "pointsOutOfTheMap.txt"
    },
    content = function(file) {
      write(pointsOutOfMap,file)
    }
  )

  output$downloadTUTree <- downloadHandler(
    filename = function() {
      "TU_tree.txt"
    },
    content = function(file) {
      write(TU_tree,file)
    }
  )

  observeEvent(input$myMap_marker_click, {
    print("##############################")
    print(input$myMap_marker_click)
    species_name <- d[d$ID == input$myMap_marker_click[["id"]],]$species
    region_name <- d[d$ID == input$myMap_marker_click[["id"]],]$region
    #proxy_tu_table %>% selectRows(c(1,2,3))
  }, ignoreInit = TRUE)


  observeEvent(input$myMap_polygon_click, {
    print("##############################")
    print(input$myMap_polygon_click)
    region_name <- input$myMap_polygon_click[["id"]]
  }, ignoreInit = TRUE)
}

# Run the application
shinyApp(ui = ui, server = server)
