
let default_tree_settings = function () {
    tree = d3.layout.phylotree();
    tree.branch_length (null);
    tree.branch_name (null);
    tree.node_span ('equal');
    tree.options ({'draw-size-bubbles' : false}, false);
    tree.style_nodes (node_colorizer);
    tree.style_edges (edge_colorizer);
    //tree.selection_label (current_selection_name);
    tree.node_circle_size (undefined);
    tree.radial (false);
};

let init_viz = function(TU_tree){
  default_tree_settings();

  tree(TU_tree).svg (svg_tree).layout();
  tree.set_tree_name("tree");
};

let re_init_viz = function(TU_tree){
  let anno = document.getElementById("tree_container").getElementsByClassName("annotations_group")[0];
  let collapse_flag = false;
  d3.select(container_tree_id).select("svg").remove();
  default_tree_settings();
  svg_tree = d3.select(container_tree_id).append("svg")
      .attr("width", width)
      .attr("height", height);
  tree(TU_tree).svg (svg_tree).layout();
  document.getElementById("tree_container").getElementsByTagName("svg")[0].append(anno);
};



let node_colorizer = function (element, data) {
    try{
        var count_class = 0;

        selection_set.forEach (function (d,i) { if (data[d]) {count_class ++; element.style ("fill", color_scheme(i), i == current_selection_id ?  "important" : null);}});

        if (count_class > 1) {

        } else {
            if (count_class == 0) {
                element.style ("fill", null);
            }
        }
    }
    catch (e) {

    }

};

let edge_colorizer = function (element, data) {
    //console.log (data[current_selection_name]);
    try {
        var count_class = 0;

        selection_set.forEach (function (d,i) { if (data[d]) {count_class ++; element.style ("stroke", color_scheme(i), i == current_selection_id ?  "important" : null);}});

        if (count_class > 1) {
            element.classed ("branch-multiple", true);
        } else
        if (count_class == 0) {
            element.style ("stroke", null)
                .classed ("branch-multiple", false);
        }
    }
    catch (e) {
    }

};

$("#container_tree_viz #display_tree").on ("click", function (e) {
    tree.options ({'branches' : 'straight'}, true);
});

$("#container_tree_viz #mp_label").on ("click", function (e) {
    tree.max_parsimony (true);
});

$("#container_tree_viz [data-direction]").on ("click", function (e) {
    var which_function = $(this).data ("direction") == 'vertical' ? tree.spacing_x : tree.spacing_y;
    which_function (which_function () + (+ $(this).data ("amount"))).update();
});


$("#container_tree_viz .phylotree-layout-mode").on ("change", function (e) {
    if ($(this).is(':checked')) {
        tree.options ({'transitions' : false} );
        if (tree.radial () != ($(this).data ("mode") == "radial")) {
            tree.radial (!tree.radial ()).placenodes().update ();
        }
        tree.options ({'transitions' : true} );
    }
});


$("#container_tree_viz #toggle_animation").on ("click", function (e) {
    var current_mode = $(this).hasClass('active');
    $(this).toggleClass('active');
    tree.options ({'transitions' : !current_mode} );
});


$("#container_tree_viz .phylotree-align-toggler").on ("change", function (e) {
    if ($(this).is(':checked')) {
        if (tree.align_tips ($(this).data ("align") == "right")) {
            tree.placenodes().update ();
        }
    }
});

function sort_nodes_tree (asc) {
    tree.traverse_and_compute (function (n) {
        var d = 1;
        if (n.children && n.children.length) {
            d += d3.max (n.children, function (d) { return d["count_depth"];});
        }
        n["count_depth"] = d;
    });
    tree.resort_children (function (a,b) {
        return (a["count_depth"] - b["count_depth"]) * (asc ? 1 : -1);
    });
}

$("#container_tree_viz #sort_original").on ("click", function (e) {
    tree.resort_children (function (a,b) {
        return a["original_child_order"] - b["original_child_order"];
    });
});

$("#container_tree_viz #sort_ascending").on ("click", function (e) {
    sort_nodes_tree (true);
});

$("#container_tree_viz #sort_descending").on ("click", function (e) {
    sort_nodes_tree (false);
});

$("#container_tree_viz #and_label").on ("click", function (e) {
    tree.internal_label (function (d) { return d.reduce (function (prev, curr) { return curr[current_selection_name] && prev; }, true)}, true);
});

$("#container_tree_viz #or_label").on ("click", function (e) {
    tree.internal_label (function (d) { return d.reduce (function (prev, curr) { return curr[current_selection_name] || prev; }, false)}, true);
});


$("#container_tree_viz #filter_add").on ("click", function (e) {
    tree.modify_selection (function (d) { return d.tag || d[current_selection_name];}, current_selection_name, false, true)
        .modify_selection (function (d) { return false; }, "tag", false, false);
});

$("#container_tree_viz #filter_remove").on ("click", function (e) {
    tree.modify_selection (function (d) { return !d.tag;});
});

$("#container_tree_viz #select_all").on ("click", function (e) {
    tree.modify_selection (function (d) { return true;});
});

$("#container_tree_viz #select_all_internal").on ("click", function (e) {
    tree.modify_selection (function (d) { return !d3.layout.phylotree.is_leafnode (d.target);});
});

$("#container_tree_viz #select_all_leaves").on ("click", function (e) {
    tree.modify_selection (function (d) { return d3.layout.phylotree.is_leafnode (d.target);});
});


$("#container_tree_viz #clear_internal").on ("click", function (e) {
    tree.modify_selection (function (d) { return d3.layout.phylotree.is_leafnode (d.target) ? d.target[current_selection_name] : false;});
});

$("#container_tree_viz #clear_leaves").on ("click", function (e) {
    tree.modify_selection (function (d) { return !d3.layout.phylotree.is_leafnode (d.target) ? d.target[current_selection_name] : false;});
});


$("#container_tree_viz #display_dengrogram").on ("click", function (e) {
    tree.options ({'branches' : 'step'}, true);
});

$("#container_tree_viz #branch_filter").on ("input propertychange", function (e) {
    var filter_value = $(this).val();

    var rx = new RegExp (filter_value,"i");

    tree.modify_selection (function (n) {
        return filter_value.length && (tree.branch_name () (n.target).search (rx)) != -1;
    },"tag");

});

$("#container_tree_viz #validate_newick").on ("click", function (e) {
    var res = d3.layout.newick_parser ( $('textarea[id$="nwk_spec"]').val(), true);
    if (res["error"] || ! res["json"]) {
        var warning_div = d3.select ("#newick_body").selectAll ("div  .alert-danger").data ([res["error"]])
        warning_div.enter ().append ("div");
        warning_div.html (function (d) {return d;}).attr ("class", "alert-danger");

    } else {
        default_tree_settings ();
        tree (res).svg (svg).layout();
        $('#newick_modal').modal('hide');
    }
});


var valid_id = new RegExp ("^[\\w]+$");

$("#container_tree_viz #selection_name_box").on ("input propertychange", function (e) {
    var name = $(this).val();

    var accept_name = (selection_set.indexOf (name) < 0) &&
        valid_id.exec (name) ;

    d3.select ("#save_selection_button").classed ("disabled", accept_name ? null : true );
});

$("#container_tree_viz #selection_rename > a").on ("click", function (e) {

    d3.select ("#save_selection_button")
        .classed ("disabled",true)
        .on ("click", function (e) { // save selection handler
            var old_selection_name = current_selection_name;
            selection_set[current_selection_id] = current_selection_name = $("#selection_name_box").val();

            if (old_selection_name != current_selection_name) {
                tree.update_key_name (old_selection_name, current_selection_name);
                update_tree_selection_names (current_selection_id);
            }
            send_click_event_to_menu_objects (new CustomEvent (selection_menu_element_action,
                {'detail' : ['save', this]}));
        });

    d3.select ("#cancel_selection_button")
        .classed ("disabled",false)
        .on ("click", function (e) { // save selection handler
            $("#selection_name_box").val(current_selection_name);
            send_click_event_to_menu_objects (new CustomEvent (selection_menu_element_action,
                {'detail' : ['cancel', this]}));
        });

    send_click_event_to_menu_objects (new CustomEvent (selection_menu_element_action,
        {'detail' : ['rename', this]}));
    e.preventDefault    ();
});

$("#container_tree_viz #selection_delete > a").on ("click", function (e) {

    tree.update_key_name (selection_set[current_selection_id], null)
    selection_set.splice (current_selection_id, 1);

    if (current_selection_id > 0) {
        current_selection_id --;
    }
    current_selection_name = selection_set[current_selection_id];
    update_tree_selection_names (current_selection_id)
    $("#selection_name_box").val(current_selection_name)


    send_click_event_to_menu_objects (new CustomEvent (selection_menu_element_action,
        {'detail' : ['save', this]}));
    e.preventDefault    ();

});

$("#container_tree_viz #selection_new > a").on ("click", function (e) {

    d3.select ("#save_selection_button")
        .classed ("disabled",true)
        .on ("click", function (e) { // save selection handler
            current_selection_name = $("#selection_name_box").val();
            current_selection_id = selection_set.length;
            selection_set.push (current_selection_name);
            update_tree_selection_names (current_selection_id);
            send_click_event_to_menu_objects (new CustomEvent (selection_menu_element_action,
                {'detail' : ['save', this]}));
        });

    d3.select ("#cancel_selection_button")
        .classed ("disabled",false)
        .on ("click", function (e) { // save selection handler
            $("#selection_name_box").val(current_selection_name);
            send_click_event_to_menu_objects (new CustomEvent (selection_menu_element_action,
                {'detail' : ['cancel', this]}));
        });

    send_click_event_to_menu_objects (new CustomEvent (selection_menu_element_action,
        {'detail' : ['new', this]}));
    e.preventDefault    ();

});

$("#container_tree_viz #clear_selection").on ("click", function (e) {
    tree.get_nodes().forEach(function (item, index) {
        delete item.bcn;
    });
    tree.modify_selection (function (d) { return false;}).placenodes().update();
});

function send_click_event_to_menu_objects (e) {
    $("#selection_new, #selection_delete, #selection_rename, #save_selection_name, #selection_name_box, #selection_name_dropdown").get().forEach (
        function (d) {
            d.dispatchEvent (e);
        }
    );
}

function update_tree_selection_names (id, skip_rebuild) {

    skip_rebuild = skip_rebuild || false;
    id = id || 0;


    current_selection_name = selection_set[id];
    current_selection_id = id;

    if (!skip_rebuild) {
        d3.selectAll (".selection_set").remove();

        d3.select ("#selection_name_dropdown")
            .selectAll (".selection_set")
            .data (selection_set)
            .enter()
            .append ("li")
            .attr ("class", "selection_set")
            .append ("a")
            .attr ("href", "#")
            .text (function (d) { return d;})
            .style ("color", function (d,i) {return color_scheme(i);})
            .on ("click", function (d,i) {update_tree_selection_names (i,true);});

    }


    d3.select ("#selection_name_box")
        .style ("color",  color_scheme(id))
        .property ("value", current_selection_name);

    tree.selection_label (selection_set[id]);
}

function selection_handler_name_box (e) {
    var name_box = d3.select (this);
    switch (e.detail[0]) {
        case 'save':
        case 'cancel':
            name_box.property ("disabled", true)
                .style ("color",  color_scheme(current_selection_id));

            break;
        case 'new':
            name_box.property ("disabled", false)
                .property ("value", "new_selection_name")
                .style ("color",  color_scheme(selection_set.length));
            break;
        case 'rename':
            name_box.property ("disabled", false);
            break;
    }

}

function selection_handler_new (e) {
    var element = d3.select (this);
    $(this).data('tooltip', false);
    switch (e.detail[0]) {
        case 'save':
        case 'cancel':
            if (selection_set.length == max_selections) {
                element.classed ("disabled", true);
                $(this).tooltip ({'title' : 'Up to ' + max_selections + ' are allowed', 'placement' : 'left'});
            } else {
                element.classed ("disabled", null);
            }
            break;
        default:
            element.classed ("disabled", true);
            break;

    }
}

function selection_handler_rename (e) {
    var element = d3.select (this);
    element.classed ("disabled", (e.detail[0] == "save" || e.detail[0] == "cancel") ? null : true);
}

function selection_handler_save_selection_name (e) {
    var element = d3.select (this);
    element.style ("display", (e.detail[0] == "save" || e.detail[0] == "cancel") ? "none" : null);
}

function selection_handler_name_dropdown (e) {
    var element = d3.select (this).selectAll (".selection_set");
    element.classed ("disabled", (e.detail[0] == "save" || e.detail[0] == "cancel") ? null : true);
}

function selection_handler_delete (e) {
    var element = d3.select (this);
    $(this).tooltip('destroy');
    switch (e.detail[0]) {
        case 'save':
        case 'cancel':
            if (selection_set.length == 1) {
                element.classed ("disabled", true);
                $(this).tooltip ({'title' : 'At least one named selection set <br> is required;<br>it can be empty, however', 'placement' : 'bottom', 'html': true});
            } else {
                element.classed ("disabled", null);
            }
            break;
        default:
            element.classed ("disabled", true);
            break;

    }
}


let phylotreeCSS = "";
$.get('./phylotree.css', function (resp) {
    phylotreeCSS = resp;
});

let saveSvg = function () {
    let svgEl = $("#tree_container>svg")[0];
    svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    var svgData = svgEl.outerHTML;
    let defsIndex = svgData.indexOf("</defs>");
    let svgStyle = "<style type='text/css'><![CDATA[" + phylotreeCSS + "]]></style>";
      svgData = [svgData.slice(0, defsIndex), svgStyle, svgData.slice(defsIndex)].join('');
      var preface = '<?xml version="1.0" standalone="no"?>';
      var svgBlob = new Blob([preface, svgData], {type:"image/svg+xml;charset=utf-8"});
      var svgUrl = URL.createObjectURL(svgBlob);
      var downloadLink = document.createElement("a");
      downloadLink.href = svgUrl;
      downloadLink.download = "TU_tree.svg";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      svgEl.removeAttribute("xmlns");
    };

/*let saveSvg = function (svgEl, name) {
    svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    var svgData = svgEl.outerHTML;
    let defsIndex = svgData.indexOf("</defs>");
    let svgStyle = "<style type=\"text/css\"><![CDATA[" + phylotreeCSS + "]]></style>";
    svgData = [svgData.slice(0, defsIndex), svgStyle, svgData.slice(defsIndex)].join('');
    var preface = '<?xml version="1.0" standalone="no"?>\r\n';
    var svgBlob = new Blob([preface, svgData], {type:"image/svg+xml;charset=utf-8"});
    var svgUrl = URL.createObjectURL(svgBlob);
    var downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = name;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    svgEl.removeAttribute("xmlns");
};

function svgToFile_tree(){
    switch ($("input[name=saveToFileOptions]:checked").val()) {
        case "svgFormat":
            saveSvg($("#tree_viz>svg")[0], 'tree_left.svg');
            break;
        case "pngFormat":
            saveSvgAsPng(d3.select('#container_tree_viz svg').node(), 'tree_left.png');
            break;
    }

}*/


/**********************************
 * Annotations
 */

let degrees_radians = function (input, to_radians = true)
{
    if (to_radians) {
        return input * (Math.PI / 180);
    }else{
        return input * (180 / Math.PI);
    }
}

let g_annotations;
let rect_x = 10, rect_y = 10, circle_r = 5, rect_dimensions = 50;
let rect_id = 1, text_id = 1;
let min_rect_width = 5, min_rect_height = 5;
let selected_rect, selected_text, selected_arc;

let startAngle = degrees_radians(90), endAngle = degrees_radians(180);
let innerRadius = 50, outerRadius = 100;
let arc_id = 1;
let all_arcs = {};
let min_arc_width = 5;
let show_text_border_tree = true;



let get_g_annotations = function (){
    let svg = d3.select(container_tree_id).select("svg");

    let g_annotations = svg.select("#annotations_group")

    if (g_annotations.empty()){
        g_annotations = svg.append("g")
            .attr("id", "annotations_group")
            .attr("class", "annotations_group");
    }
    return g_annotations;
}

let drag_rect = d3.behavior.drag()
    .on("drag", function(d,i) {
		
		let tree_id = d3.select(this).attr("tree");
		//let box = d3.select(this).node().getBBox();
		//let new_x = parseFloat(this.getAttribute("x")) + d3.event.dx;
        //let new_y = parseFloat(this.getAttribute("y")) + d3.event.dy;
        let rect_width = parseFloat(d3.select(this).attr("width"));
        let rect_height = parseFloat(d3.select(this).attr("height"));
        selected_rect = d3.select(this).attr("id");
		
		let svg_dimensions = get_svg_dimensions(tree_id);
		let max_height = svg_dimensions[0], max_width = svg_dimensions[1];
		
		let x = parseFloat(d3.select(this).attr("x")), y = parseFloat(d3.select(this).attr("y"));
		
		if (x >= 0 && (x + rect_width) <= max_width){
			x += d3.event.dx;
		}else if (x < 0){
			x = 0;
		}else {
			x = max_width - rect_width;
		}
		
		if (y >= 0 && (y + rect_height) <= max_height){
			y += d3.event.dy;
		}else if (y < 0){
			y = 0;
		}else {
			y = max_height - rect_height;
		}


        d3.select(this)
            .attr("x", function(d,i){return x})
            .attr("y", function(d,i){return y});

        d3.select("#" + selected_rect + "_TL")
            .attr("cx", function(d,i){return x})
            .attr("cy", function(d,i){return y});

        d3.select("#" + selected_rect + "_BR")
            .attr("cx", function(d,i){return (x + rect_width)})
            .attr("cy", function(d,i){return (y + rect_height)});

        update_selected_rectangle();

    });

let drag_tl_circle =
    d3.behavior.drag()
        .on("drag", function(d,i) {
			let tree_id = d3.select(this).attr("tree");
			let svg_dimensions = get_svg_dimensions(tree_id);
			let max_height = svg_dimensions[0], max_width = svg_dimensions[1];
			let box = d3.select(this).node().getBBox();
			let x = parseFloat(d3.select(this).attr("cx"));
			let y = parseFloat(d3.select(this).attr("cy"));
			
			selected_rect = this.getAttribute("id").replace("_TL", "")
			let rect = document.getElementById(selected_rect);
			let width = parseFloat(rect.getAttribute("width")),
				height = parseFloat(rect.getAttribute("height"));
			let br_circle = d3.select("#" + selected_rect + "_BR");
				
			if (x >= 0 && (x + box.width) <= max_width){
				x += d3.event.dx;
			}else if (x < 0){
				x = 0;
			}else {
				x = max_width - box.width;
			}
			
			if (y >= 0 && (y + box.height) <= max_height){
				y += d3.event.dy;
			}else if (y < 0){
				y = 0;
			}else {
				y = max_height - box.height;
			}
			
			let new_width = br_circle.attr("cx") - x;
			let new_height = br_circle.attr("cy") - y;
            
            if (new_width > min_rect_width && new_height > min_rect_height) {
                d3.select(this)
                    .attr("cx", function (d, i) {
                        return x
                    })
                    .attr("cy", function (d, i) {
                        return y
                    });

                d3.select("#" + selected_rect)
                    .attr("x", function (d, i) {
                        return x
                    })
                    .attr("y", function (d, i) {
                        return y
                    })
                    .attr("width", new_width)
                    .attr("height", new_height);
            }
			
            update_selected_rectangle();
        });

let drag_br_circle =
    d3.behavior.drag()
        .on("drag", function(d,i) {
			let tree_id = d3.select(this).attr("tree");
			let svg_dimensions = get_svg_dimensions(tree_id);
			let max_height = svg_dimensions[0], max_width = svg_dimensions[1];
			let box = d3.select(this).node().getBBox();
			let x = parseFloat(d3.select(this).attr("cx"));
			let y = parseFloat(d3.select(this).attr("cy"));
			
			selected_rect = this.getAttribute("id").replace("_BR", "")
			let rect = document.getElementById(selected_rect);
			let width = parseFloat(rect.getAttribute("width")),
				height = parseFloat(rect.getAttribute("height"));
			let tl_circle = d3.select("#" + selected_rect + "_TL");
				
			if (x >= 0 && (x + box.width) <= max_width){
				x += d3.event.dx;
			}else if (x < 0){
				x = 0;
			}else {
				x = max_width - box.width;
			}
			
			if (y >= 0 && (y + box.height) <= max_height){
				y += d3.event.dy;
			}else if (y < 0){
				y = 0;
			}else {
				y = max_height - box.height;
			}
			
			let new_width = x - tl_circle.attr("cx");
			let new_height = y - tl_circle.attr("cy");
            
            if (new_width > min_rect_width && new_height > min_rect_height) {
                d3.select(this)
                    .attr("cx", function (d, i) {
                        return x
                    })
                    .attr("cy", function (d, i) {
                        return y
                    });

                d3.select("#" + selected_rect)
                    .attr("width", new_width)
                    .attr("height", new_height);
            }
			
            update_selected_rectangle();
			
        });


let add_new_rectangle = function(){
    let tree_id = "tree";
    g_annotations = get_g_annotations();

    selected_rect = "rect_" + rect_id;

    let rect = g_annotations.append("rect")
        .datum([{x: rect_x, y: rect_y}])
        .attr("id", function (){ return selected_rect})
        .attr('x', function (d) { return rect_x; })
        .attr('y', function (d) { return rect_y; })
        .style("fill", "green")
        .style("opacity", 0.5)
        .attr("width", rect_dimensions)
        .attr("height", rect_dimensions)
		.attr("tree", tree_id)
        .call(drag_rect)
        .on("click", function(d,i){
            selected_rect = this.getAttribute("id");
			update_selected_rectangle();
		})
		.on("mouseover", function(d) {
			d3.select(this).style("cursor", "pointer"); 
		  })
		.on("mouseout", function(d) {
			d3.select(this).style("cursor", "default"); 
		  });;

    g_annotations.append("circle")
        .datum([{x: (rect_x - circle_r), y: (rect_y - circle_r)}])
        .attr("id",  "rect_" + rect_id + "_TL")
        .attr("cx", function (d){return (rect_x);})
        .attr("cy", function (d){return (rect_y);})
        .attr("r", circle_r)
        .style("fill", "black")
        .attr("class", "edit_circle_shown")
		.attr("tree", tree_id)
        .call(drag_tl_circle);

    g_annotations.append("circle")
        .datum([{cx: rect_x + rect_dimensions - circle_r, cy: rect_x + rect_dimensions - circle_r}])
        .attr("id", "rect_" + rect_id + "_BR")
        .attr("cx", function (d){return (rect_x + rect_dimensions);})
        .attr("cy", function (d){return (rect_x + rect_dimensions);})
        .attr("r", circle_r)
        .style("fill", "black")
        .attr("class", "edit_circle_shown")
		.attr("tree", tree_id)
        .call(drag_br_circle);

    rect_id++;

    update_selected_rectangle();

}

let update_selected_rectangle = function (){
	
	let tree_id = d3.select("#" + selected_rect).attr("tree");

    let all_circles = get_g_annotations(tree_id).selectAll("circle")
        .filter(function (){
            return d3.select(this).attr("id").includes("rect");
        })
        .style("fill", "black");


    d3.select("#" + selected_rect + "_TL")
        .style("fill", "red");

    d3.select("#" + selected_rect + "_BR")
        .style("fill", "red");

}


jscolor.presets.default = {
    format:'rgba', uppercase:false, hash:false, closeButton:true
};


let change_rectangle_color = function (tree_id, picker){
    g_annotations = get_g_annotations(tree_id);
	selected_rect = get_selected_rectangle(tree_id);
    g_annotations.select("#" + selected_rect)
        .style("fill", picker.toHEXString())
        .style("opacity", picker.channel("A"));
}

let trash_rectangle = function (tree_id){
	
	selected_rect = get_selected_rectangle(tree_id);
	
    g_annotations.select("#" + selected_rect)
        .remove();
    g_annotations.select("#" + selected_rect + "_TL")
        .remove();
    g_annotations.select("#" + selected_rect + "_BR")
        .remove();
}

let get_selected_rectangle = function (tree_id){
	g_annotations = get_g_annotations(tree_id);
	
	let selected_rect = g_annotations.selectAll("circle")
        .filter(function (){
            return d3.select(this).attr("id").includes("rect") && d3.select(this).style("fill") == "rgb(255, 0, 0)";
        }).attr("id").slice(0, -3);
		
	return selected_rect;
}


let get_svg_dimensions = function (tree_id){
	let svg, max_height, max_width;
	svg = d3.select(container_tree_id).select("svg");
	
	max_height = svg.attr("height");
	max_width = svg.attr("width");
		
	return [max_height, max_width];
}

let drag_text = d3.behavior.drag()
    .on("drag", function(d,i) {
		let tree_id = d3.select(this).attr("tree");
		let box = d3.select(this).node().getBBox();
		let svg_dimensions = get_svg_dimensions(tree_id);
		let max_height = svg_dimensions[0], max_width = svg_dimensions[1];
		
		let x = parseFloat(d3.select(this).attr("x")), y = parseFloat(d3.select(this).attr("y"));
		
		if (x >= 0 && (x + box.width) <= max_width){
			x += d3.event.dx;
		}else if (x < 0){
			x = 0;
		}else {
			x = max_width - box.width;
		}
		
		if (y >= 10 && (y + box.height) <= max_height){
			y += d3.event.dy;
		}else if (y < 10){
			y = 10;
		}else {
			y = max_height - box.height;
		}

        selected_text = this.getAttribute("id");
        d3.select(this)
            .attr("x", function(d,i){return x})
            .attr("y", function(d,i){return y});
		update_selected_text();

    });

let add_new_text = function(tree_id){

    g_annotations = get_g_annotations(tree_id);
	
	selected_text = "text_" + text_id;

    g_annotations.append("text")
        .datum([{x: rect_x, y: rect_y}])
        .attr("id", "text_" + text_id)
        .attr("x", rect_x)
        .attr("y", rect_y)
        .attr("font-family", "sans-serif")
        .attr("font-size", "12px")
        .text("Text")
		.attr("tree", tree_id)
        .call(drag_text)
        .on("click", function(d,i){
            selected_text = this.getAttribute("id");
			update_selected_text();
			$("#text_annotation_contents_" + this.getAttribute("tree")).val(d3.select(this).text());
			console.log(d3.select(this).style("font-size"));
			$("#font_size_" + this.getAttribute("tree")).val(d3.select(this).style("font-size").slice(0,-2));
        })
		.on("mouseover", function(d) {
			d3.select(this).style("cursor", "pointer"); 
		  })
		.on("mouseout", function(d) {
			d3.select(this).style("cursor", "default"); 
		  });

    text_id++;
	
	update_selected_text();
}

let trash_text = function (tree_id){
    g_annotations = get_g_annotations(tree_id);
    g_annotations.select("#" + selected_text)
        .remove();
		
	g_annotations.selectAll("path")
        .filter(function (){
            return d3.select(this).attr("id").includes("_border");
        })
		.remove();
}

let get_selected_text = function (tree_id){
	g_annotations = get_g_annotations(tree_id);
	
	let selected_text = g_annotations.selectAll("path")
        .filter(function (){
            return d3.select(this).attr("id").includes("rect") && d3.select(this).style("fill") == "rgb(255, 0, 0)";
        }).attr("id").slice(0, -3);
		
	return selected_text;
}

let update_selected_text = function (){
	
	let tree_id = d3.select("#" + selected_text).attr("tree");
	
	let show_text_border = true;
	
	if (!show_text_border_tree){
		show_text_border = false;
	}
	
	
	if (!show_text_border){
		return;
	}
	
	g_annotations = get_g_annotations(tree_id);
	
	let text_element = d3.select("#" + selected_text);

	g_annotations.selectAll("path")
        .filter(function (){
            return d3.select(this).attr("id").includes("_border");
        })
		.remove();
		
		
	var rect = text_element.node().getBBox();
	var offset = 2; // enlarge rect box 2 px on left & right side
	//selection.classed("mute", (selection.classed("mute") ? false : true));

	pathinfo = [
		{x: rect.x-offset, y: rect.y }, 
		{x: rect.x+offset + rect.width, y: rect.y}, 
		{x: rect.x+offset + rect.width, y: rect.y + rect.height }, 
		{x: rect.x-offset, y: rect.y + rect.height},
		{x: rect.x-offset, y: rect.y },
	];

	// Specify the function for generating path data
	var d3line = d3.svg.line()
		.x(function(d){return d.x;})
		.y(function(d){return d.y;})
		.interpolate("linear"); 
	// Draw the line
	g_annotations.append("svg:path")
		.attr("d", d3line(pathinfo))
		.style("stroke-width", 1)
		.style("stroke", "red")
		.style("fill", "none")
		.attr("id", selected_text + "_border");
}


$('#myFontPicker_tree').fontpicker({
    variants:false
}).on('change',function() {

    d3.select("#" + selected_text)
        .attr("font-family", this.value);
	update_selected_text();
});


let change_text_color = function (tree_id, picker){
    g_annotations = get_g_annotations(tree_id);
    g_annotations.select("#" + selected_text)
        .style("fill", picker.toHEXString())
        .style("opacity", picker.channel("A"));
}


let change_font_size = function (tree_id){
    g_annotations = get_g_annotations(tree_id);
    if (tree_id == "tree_1"){
        g_annotations.select("#" + selected_text)
            .style("font-size", document.getElementById("font_size_tree_1").value + "px");
    }else{
        g_annotations.select("#" + selected_text)
            .style("font-size", document.getElementById("font_size_tree_2").value + "px");
    }
	
	update_selected_text();

}


$("#text_annotation_contents_tree_1").on('keyup',function (){
    d3.select(container_tree_id).select("#" + selected_text)
        .text(this.value);
	update_selected_text();
})


var arc = d3.svg.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius)
    .startAngle(startAngle)
    .endAngle(endAngle);


let drag_arc = d3.behavior.drag()
    .on("dragstart", function (d){
    })
    .on("drag", function(d,i) {
		let tree_id = d3.select(this).attr("tree");
		selected_arc = this.getAttribute("id");
		let box = d3.select(this).node().getBBox();
		let [max_height, max_width] = get_svg_dimensions(tree_id);
		let [x, y] = get_transform_coordinates(selected_arc);
		
		let box_x = box.x + x, box_y = box.y + y; //find the actual box coordinates considering box coordinates are relative to the arc coordinates

		if (box_x >= 0 && (box_x + box.width) <= max_width){
			x += d3.event.dx;
		}else if (box_x < 0){
			x = 0 - box_x - box.x;
		}else {
			x = max_width - box.width - box.x;
		}
		
		if (box_y >= 0 && (box_y + box.height) <= max_height){
			y += d3.event.dy;
		}else if (box_y < 0){
			y = 0 - box_y - box.y;
		}else {
			y = max_height - box.height - box.y;
		}
		
        d3.select(this)
            .attr("transform", function(){return "translate(" + x + "," + y + ")"});
        update_arc();
    })
    .on("dragend", function (){
    });


let slope = function (a, b) {
    if (a[0] == b[0]) {
        return null;
    }

    return (b[1] - a[1]) / (b[0] - a[0]);
}

let get_distance_two_points = function (x1, y1, x2, y2){
    return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
}

let get_angle = function (x1, y1, x2, y2){
    return (Math.atan2(y2 - y1, x2 - x1) - Math.PI / 2 + Math.PI * 2) % (Math.PI * 2);
}

let drag_ir_circle = d3.behavior.drag()
    .on("dragstart", function (d){})
    .on("drag", function(d,i) {
	
        selected_arc = this.getAttribute("id").replace("_IR", "");
        let OR_circle = document.getElementById(selected_arc + "_OR");
        let OR_circle_x = OR_circle.getAttribute("cx");
        let OR_circle_y = OR_circle.getAttribute("cy");
        let arc_coor = get_transform_coordinates(selected_arc);
        let new_x, new_y;

        let line_slope = slope([OR_circle_x, OR_circle_y], arc_coor);
        let b = OR_circle_y - (line_slope * OR_circle_x);

        //let IR_angle = (Math.atan2(arc_coor[1] - OR_circle_y, arc_coor[0] - OR_circle_x) - Math.PI / 2 + Math.PI * 2) % (Math.PI * 2);
        let IR_angle = get_angle(OR_circle_x, OR_circle_y, arc_coor[0], arc_coor[1]);

        if (IR_angle >= ( -(Math.PI/4)) && IR_angle <= (Math.PI / 4)){
            new_y = parseFloat(this.getAttribute("cy")) + d3.event.dy;
            new_x = (new_y - b)/ line_slope;
        }else if (IR_angle >= (Math.PI / 4) && IR_angle <= (3/4 * Math.PI)){
            new_x = parseFloat(this.getAttribute("cx")) + d3.event.dx;
            new_y = (line_slope * new_x) + b;
        }else if (IR_angle >= (3/4 * Math.PI) && IR_angle <= (Math.PI + Math.PI /4)){
            new_y = parseFloat(this.getAttribute("cy")) + d3.event.dy;
            new_x = (new_y - b)/ line_slope;
        }else{
            new_x = parseFloat(this.getAttribute("cx")) + d3.event.dx;
            new_y = (line_slope * new_x) + b;
        }

        //let arc = document.getElementById(selected_arc);
        d3.select(this)
            .attr("cx", function (d, i) {return new_x})
            .attr("cy", function (d, i) {return new_y});


        if (all_arcs[selected_arc].innerRadius >= 0 && (all_arcs[selected_arc].outerRadius - all_arcs[selected_arc].innerRadius) >= min_arc_width) {
            all_arcs[selected_arc].innerRadius = get_distance_two_points(arc_coor[0], arc_coor[1], new_x, new_y);
        } else if (all_arcs[selected_arc].innerRadius <= 0) {
            all_arcs[selected_arc].innerRadius = 0;
        }else {
            all_arcs[selected_arc].innerRadius = all_arcs[selected_arc].outerRadius - min_arc_width;
        }

        let arc = d3.svg.arc()
            .innerRadius(all_arcs[selected_arc].innerRadius)
            .outerRadius(all_arcs[selected_arc].outerRadius)
            .startAngle(all_arcs[selected_arc].startAngle)
            .endAngle(all_arcs[selected_arc].endAngle);

        d3.select("#" + selected_arc)
            .attr("d", arc);

        update_arc();
    })
    .on("dragend", function(d,i) {
        update_arc();
    });

let drag_or_circle = d3.behavior.drag()
    .on("dragstart", function (d){})
    .on("drag", function(d,i) {
        //let new_x = parseFloat(this.getAttribute("cx")) + d3.event.dx;
        //let new_y = parseFloat(this.getAttribute("cy")) + d3.event.dy;
        selected_arc = this.getAttribute("id").replace("_OR", "")
        //let arc = document.getElementById(selected_arc);
        let IR_circle = document.getElementById(selected_arc + "_IR");
        let IR_circle_x = IR_circle.getAttribute("cx");
        let IR_circle_y = IR_circle.getAttribute("cy");
        let arc_coor = get_transform_coordinates(selected_arc);
        let new_x, new_y;

        let line_slope = slope([IR_circle_x, IR_circle_y], arc_coor);
        let b = IR_circle_y - (line_slope * IR_circle_x);

        //let OR_angle = (Math.atan2(arc_coor[1] - IR_circle_y, arc_coor[0] - IR_circle_x) - Math.PI / 2 + Math.PI * 2) % (Math.PI * 2);
        let OR_angle = get_angle(IR_circle_x, IR_circle_y, arc_coor[0], arc_coor[1])

        if (OR_angle >= ( -(Math.PI/4)) && OR_angle <= (Math.PI / 4)){
            new_y = parseFloat(this.getAttribute("cy")) + d3.event.dy;
            new_x = (new_y - b)/ line_slope;
        }else if (OR_angle >= (Math.PI / 4) && OR_angle <= (3/4 * Math.PI)){
            new_x = parseFloat(this.getAttribute("cx")) + d3.event.dx;
            new_y = (line_slope * new_x) + b;
        }else if (OR_angle >= (3/4 * Math.PI) && OR_angle <= (Math.PI + Math.PI /4)){
            new_y = parseFloat(this.getAttribute("cy")) + d3.event.dy;
            new_x = (new_y - b)/ line_slope;
        }else{
            new_x = parseFloat(this.getAttribute("cx")) + d3.event.dx;
            new_y = (line_slope * new_x) + b;
        }


        d3.select(this)
            .attr("cx", function (d, i) {return new_x})
            .attr("cy", function (d, i) {return new_y});
			
        if ((all_arcs[selected_arc].outerRadius - all_arcs[selected_arc].innerRadius) >= min_arc_width) {
            all_arcs[selected_arc].outerRadius = get_distance_two_points(arc_coor[0], arc_coor[1], new_x, new_y);
        }else {
            all_arcs[selected_arc].outerRadius = all_arcs[selected_arc].innerRadius + min_arc_width;
        }


        let arc = d3.svg.arc()
            .innerRadius(all_arcs[selected_arc].innerRadius)
            .outerRadius(all_arcs[selected_arc].outerRadius)
            .startAngle(all_arcs[selected_arc].startAngle)
            .endAngle(all_arcs[selected_arc].endAngle);

        d3.select("#" + selected_arc)
            .attr("d", arc);
        update_arc();
    })
    .on("dragend", function(d,i) {
        update_arc();
    });

let drag_sa_circle = d3.behavior.drag()
    .on("dragstart", function (d){})
    .on("drag", function(d,i) {
        let new_x = parseFloat(this.getAttribute("cx")) + d3.event.dx;
        let new_y = parseFloat(this.getAttribute("cy")) + d3.event.dy;
        selected_arc = this.getAttribute("id").replace("_SA", "");
        //let arc = document.getElementById(selected_arc);
        let EA_circle = document.getElementById(selected_arc + "_EA");
        let EA_circle_x = EA_circle.getAttribute("cx");
        let EA_circle_y = EA_circle.getAttribute("cy");
        let arc_coor = get_transform_coordinates(selected_arc);

        //let SA_angle = (Math.atan2(arc_coor[1] - new_y, arc_coor[0] - new_x) - Math.PI / 2 + Math.PI * 2) % (Math.PI * 2);
        let SA_angle = get_angle(new_x, new_y, arc_coor[0], arc_coor[1]);

        d3.select(this)
            .attr("cx", function (d, i) {
                return new_x
            })
            .attr("cy", function (d, i) {
                return new_y
            });
        if (SA_angle >= (-(Math.PI / 4)) && SA_angle <= (Math.PI / 4)) {
            all_arcs[selected_arc].startAngle += degrees_radians(d3.event.dx) % (Math.PI * 2);
        } else if (SA_angle >= (Math.PI / 4) && SA_angle <= (3 / 4 * Math.PI)) {
            all_arcs[selected_arc].startAngle += degrees_radians(d3.event.dy) % (Math.PI * 2);
        } else if (SA_angle >= (3 / 4 * Math.PI) && SA_angle <= (Math.PI + Math.PI / 4)) {
            all_arcs[selected_arc].startAngle -= degrees_radians(d3.event.dx) % (Math.PI * 2);
        } else {
            all_arcs[selected_arc].startAngle -= degrees_radians(d3.event.dy) % (Math.PI * 2);
        }

        let arc = d3.svg.arc()
            .innerRadius(all_arcs[selected_arc].innerRadius)
            .outerRadius(all_arcs[selected_arc].outerRadius)
            .startAngle(all_arcs[selected_arc].startAngle)
            .endAngle(all_arcs[selected_arc].endAngle);

        d3.select("#" + selected_arc)
            .attr("d", arc);
        update_arc();
    })
    .on("dragend", function(d,i) {
        update_arc();
    });

let drag_ea_circle = d3.behavior.drag()
    .on("dragstart", function (d){})
    .on("drag", function(d,i) {
        let new_x = parseFloat(this.getAttribute("cx")) + d3.event.dx;
        let new_y = parseFloat(this.getAttribute("cy")) + d3.event.dy;
        selected_arc = this.getAttribute("id").replace("_EA", "")
        //let arc = document.getElementById(selected_arc);
        let arc_coor = get_transform_coordinates(selected_arc);
        d3.select(this)
            .attr("cx", function (d, i) {return new_x})
            .attr("cy", function (d, i) {return new_y});

        //let EA_angle = (Math.atan2(arc_coor[1] - new_y, arc_coor[0] - new_x) - Math.PI / 2 + Math.PI * 2) % (Math.PI * 2);
        let EA_angle = get_angle(new_x, new_y, arc_coor[0], arc_coor[1]);

        if (EA_angle >= ( -(Math.PI/4)) && EA_angle <= (Math.PI / 4)){
            all_arcs[selected_arc].endAngle += degrees_radians(d3.event.dx);
        }else if (EA_angle >= (Math.PI / 4) && EA_angle <= (3/4 * Math.PI)){
            all_arcs[selected_arc].endAngle += degrees_radians(d3.event.dy);
        }else if (EA_angle >= (3/4 * Math.PI) && EA_angle <= (Math.PI + Math.PI /4)){
            all_arcs[selected_arc].endAngle -= degrees_radians(d3.event.dx);
        }else{
            all_arcs[selected_arc].endAngle -= degrees_radians(d3.event.dy);
        }


        let arc = d3.svg.arc()
            .innerRadius(all_arcs[selected_arc].innerRadius)
            .outerRadius(all_arcs[selected_arc].outerRadius)
            .startAngle(all_arcs[selected_arc].startAngle)
            .endAngle(all_arcs[selected_arc].endAngle);

        d3.select("#" + selected_arc)
            .attr("d", arc);
        update_arc();
    })
    .on("dragend", function(d,i) {
        update_arc();
    });

let get_transform_coordinates = function (element){
	try{
		let transform = document.getElementById(element).getAttribute("transform").replace("translate(", "").replace(")","").split(",");
		let x = parseFloat(transform[0]), y = parseFloat(transform[1]);
		return [x, y];
	}catch(err){
		return [0,0];
	}
}



let update_arc = function (){
		
    let coor = get_transform_coordinates(selected_arc);
    let x = coor[0], y = coor[1];

    let innerRadius = all_arcs[selected_arc].innerRadius, outerRadius = all_arcs[selected_arc].outerRadius,
        startAngle = all_arcs[selected_arc].startAngle, endAngle = all_arcs[selected_arc].endAngle;

    let IR_coor = find_circle_coordinates(x, y, innerRadius, (startAngle +(endAngle - startAngle)/2));
    let OR_coor = find_circle_coordinates(x, y, outerRadius, (startAngle +(endAngle - startAngle)/2));
    let SA_coor = find_circle_coordinates(x, y, innerRadius + (outerRadius - innerRadius) /2, startAngle);
    let EA_coor = find_circle_coordinates(x, y, innerRadius + (outerRadius - innerRadius) /2, endAngle);

    let IR_angle = (Math.atan2(coor[1] - IR_coor[1], coor[0] - IR_coor[0]) - Math.PI / 2 + Math.PI * 2) % (Math.PI * 2);
    let OR_angle = (Math.atan2(coor[1] - IR_coor[1], coor[0] - IR_coor[0]) - Math.PI / 2 + Math.PI * 2) % (Math.PI * 2);

    d3.select("#" + selected_arc + "_IR")
        .attr("cx", function (){return IR_coor[0];})
        .attr("cy", function (){return IR_coor[1];});

    d3.select("#" + selected_arc + "_OR")
        .attr("cx", function (){return OR_coor[0];})
        .attr("cy", function (){return OR_coor[1];});

    d3.select("#" + selected_arc + "_SA")
        .attr("cx", function (){return SA_coor[0];})
        .attr("cy", function (){return SA_coor[1];});

    d3.select("#" + selected_arc + "_EA")
        .attr("cx", function (){return EA_coor[0];})
        .attr("cy", function (){return EA_coor[1];});
		
	update_selected_arc();
}


let find_circle_coordinates = function (center_x, center_y, r, a){
    a = a % degrees_radians(360);
    let x = center_x, y = center_y;
    x += Math.sin(a) * r;
    y += -(Math.cos(a) * r);
    return [x, y];
}


let add_new_arc = function(){
    let tree_id = "tree";
    g_annotations = get_g_annotations(tree_id);
	
	selected_arc = "arc_" + arc_id;

    g_annotations.append("path")
        .datum([{x: 0, y: 0}])
        .attr("id", function () {
            return "arc_" + arc_id;
        })
        .attr("d", arc)
        .style("fill", "green")
        .style("opacity", 0.5)
		.attr("tree", tree_id)
        .call(drag_arc)
        .on("click", function(d,i){
            selected_arc = this.getAttribute("id");
			 update_selected_arc();
        })
		.on("mouseover", function(d) {
			d3.select(this).style("cursor", "pointer"); 
		  })
		.on("mouseout", function(d) {
			d3.select(this).style("cursor", "default"); 
		  });;

    all_arcs["arc_" + arc_id] = {
        "innerRadius": innerRadius,
        "outerRadius": outerRadius,
        "startAngle": startAngle,
        "endAngle": endAngle
    };
	

    g_annotations.append("circle")
        .datum([{x: 0, y: 0}])
        .attr("id", "arc_" + arc_id + "_IR")
        .attr("cx", function (d) {
            return find_circle_coordinates(0, 0, innerRadius, (startAngle + (endAngle - startAngle) / 2))[0];
        })
        .attr("cy", function (d) {
            return find_circle_coordinates(0, 0, innerRadius, (startAngle + (endAngle - startAngle) / 2))[1];
        })
        .attr("r", circle_r)
        .style("fill", "black")
        .attr("class", "edit_circle_shown")
		.attr("tree", tree_id)
        .call(drag_ir_circle);

    g_annotations.append("circle")
        .datum([{x: 0, y: 0}])
        .attr("id", "arc_" + arc_id + "_OR")
        .attr("cx", function (d) {
            return find_circle_coordinates(0, 0, outerRadius, (startAngle + (endAngle - startAngle) / 2))[0];
        })
        .attr("cy", function (d) {
            return find_circle_coordinates(0, 0, outerRadius, (startAngle + (endAngle - startAngle) / 2))[1];
        })
        .attr("r", circle_r)
        .style("fill", "black")
        .attr("class", "edit_circle_shown")
		.attr("tree", tree_id)
        .call(drag_or_circle);

    g_annotations.append("circle")
        .datum([{x: 0, y: 0}])
        .attr("id", "arc_" + arc_id + "_SA")
        .attr("cx", function (d) {
            return find_circle_coordinates(0, 0, innerRadius + (outerRadius - innerRadius) / 2, startAngle)[0];
        })
        .attr("cy", function (d) {
            return find_circle_coordinates(0, 0, innerRadius + (outerRadius - innerRadius) / 2, startAngle)[1];
        })
        .attr("r", circle_r)
        .style("fill", "black")
        .attr("class", "edit_circle_shown")
		.attr("tree", tree_id)
        .call(drag_sa_circle);

    g_annotations.append("circle")
        .datum([{x: 0, y: 0}])
        .attr("id", "arc_" + arc_id + "_EA")
        .attr("cx", function (d) {
            return find_circle_coordinates(0, 0, innerRadius + (outerRadius - innerRadius) / 2, endAngle)[0];
        })
        .attr("cy", function (d) {
            return find_circle_coordinates(0, 0, innerRadius + (outerRadius - innerRadius) / 2, endAngle)[1];
        })
        .attr("r", circle_r)
        .style("fill", "black")
        .attr("class", "edit_circle_shown")
		.attr("tree", tree_id)
        .call(drag_ea_circle);

    arc_id++;
	
	update_selected_arc();
}

let trash_arc = function (tree_id){
	selected_arc = get_selected_arc(tree_id);

    g_annotations.select("#" + selected_arc)
        .remove();

    g_annotations.select("#" + selected_arc + "_IR")
        .remove();

    g_annotations.select("#" + selected_arc + "_OR")
        .remove();

    g_annotations.select("#" + selected_arc + "_SA")
        .remove();

    g_annotations.select("#" + selected_arc + "_EA")
        .remove();
}

let change_arc_color = function (tree_id, picker){
	selected_arc = get_selected_arc(tree_id);
    g_annotations.select("#" + selected_arc)
        .style("fill", picker.toHEXString())
        .style("opacity", picker.channel("A"));
}


let update_selected_arc = function (){
	
	let tree_id = d3.select("#" + selected_arc).attr("tree");

  let all_circles = get_g_annotations(tree_id).selectAll("circle")
      .filter(function (){
          return d3.select(this).attr("id").includes("arc");
      })
      .style("fill", "black");


  d3.select("#" + selected_arc + "_IR")
      .style("fill", "red");
		
	d3.select("#" + selected_arc + "_OR")
		.style("fill", "red");
	
	d3.select("#" + selected_arc + "_SA")
		.style("fill", "red");
	
	d3.select("#" + selected_arc + "_EA")
		.style("fill", "red");

    
}


let get_selected_arc = function (tree_id){
	g_annotations = get_g_annotations(tree_id);
	
	let selected_arc = g_annotations.selectAll("circle")
        .filter(function (){
            return d3.select(this).attr("id").includes("arc") && d3.select(this).style("fill") == "rgb(255, 0, 0)";
        }).attr("id").slice(0, -3);
		
	return selected_arc;
}



let change_annotations_color = function (picker){

    let svg = d3.select(container_tree_id).select("svg").select("#annotations_group");

    svg.selectAll('rect')
        .style("fill", picker.toHEXString())
        .style("opacity", picker.channel("A"));

    svg.selectAll('path')
        .style("fill", picker.toHEXString())
        .style("opacity", picker.channel("A"));

    svg.selectAll('text')
        .style("fill", picker.toHEXString())
        .style("opacity", picker.channel("A"));
}


let trash_all = function (){
    let svg = d3.select(container_tree_id).select("svg");
    svg.select("#annotations_group").remove();
    g_annotations = null;
}


// put the shapes in the beginning of the SVG for production, and put them in the end for editing
let reorder_svg_annotations = function (){

    let container = document.getElementById("tree_container");
    let first_child = container.getElementsByTagName("svg")[0]
        .getElementsByTagName("g")[0].getAttribute("id");
    let tree = container.getElementsByClassName("phylotree-container")[0];
    let anno = container.getElementsByClassName("annotations_group")[0];
    if (first_child == null) {
        anno.parentNode.insertBefore(anno, tree);
    }else{
        tree.parentNode.insertBefore(tree, anno);
    }
}

$("#container_tree_viz #toggle_annotation").on ("click", function (e) {
    let current_mode = $(this).hasClass('active');
    $(this).toggleClass('active');
    $("#annotations_control_tree").toggle(500);
    document.getElementById("tree_viz_wrapper").style.transition = "0.5s";
    current_mode?
        document.getElementById("tree_viz_wrapper").style.height = "480px":
        document.getElementById("tree_viz_wrapper").style.height = "330px";
});


$("#container_tree_viz #editing_points").on ("click", function (e) {
    let current_mode = $(this).hasClass('active');
    $(this).toggleClass('active');
	g_annotations = get_g_annotations()
	
	if (current_mode){
		g_annotations.selectAll(".edit_circle_shown")
		.attr("class", "edit_circle_hidden");
		
		g_annotations.selectAll("path")
			.filter(function (){
				return d3.select(this).attr("id").includes("_border");
			})
			.remove();
		show_text_border_tree = false;
	}else{
		
		g_annotations.selectAll(".edit_circle_hidden")
			.attr("class", "edit_circle_shown");
		show_text_border_tree = true;
	}
    
});




