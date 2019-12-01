text
  = ws test:template* { return test; }

template
  = system_template
  / person_template
  / relationship_template
  / boundary_template
  / component_or_component_template

boundary_template
  = object_type:boundary begin_params name:string comma type:string end_params begin_boundary systems:boundary_param* end_boundary
  { return {"object_type": object_type, "name": name, "type": type, "systems": systems}; }

boundary_param
  = system_template
  / component_or_component_template
  / boundary_template

person_template
  = chars:variable_chart+ equal object_type:person begin_params name:string comma description:string end_params end_object
  { return {"object_type": object_type, "name": name, "description": description, "variable": chars.join("")}; }

system_template
  = chars:variable_chart+ equal object_type:system begin_params name:string comma description:string end_params end_object
  { return {"object_type": object_type, "name": name, "description": description, "variable": chars.join("")}; }

relationship_template
  = object_type:relationshipType begin_params start_variable:variable_chart+ comma end_variable:variable_chart+ comma description:string technology:optional_arg? end_params end_object
  { return {"object_type": object_type, "description": description, "technology": technology, "start": start_variable.join(""), "end": end_variable.join("")}; }

component_or_component_template
  = chars:variable_chart+ equal object_type:component_or_component begin_params name:string comma description:string comma technology:string end_params end_object { return {"object_type": object_type, "name": name, "description": description, "technology": technology, "variable": chars.join("")}; }

optional_arg
  = comma arg:string { return arg; }

system
  = software_system
  / existing_software_system

component_or_component
  = container
  / component
  / database

bool
  = false
  / true

false
  = "false"i { return false; }

true
  = "true"i { return true; }

person
  = "Person"i { return 1; }

software_system
  = "System"i { return 2; }

existing_software_system
  = "ExistingSystem"i { return 3; }

relationshipType
  = "Rel"i { return 4; }

boundary
  = "Boundary"i { return 5; }

container
  = "Container"i { return 6; }

component
  = "Component"i { return 7; }

database
  = "Database"i { return 8; }

string "string"
  = quotation_mark chars:unescaped* quotation_mark { return chars.join(""); }

unescaped
  = [^\0-\x1F\x22\x5C]

variable_chart
  = all_letters
    / "_"
    / [0-9]

all_letters
  = [a-z]i

quotation_mark
  = '"'

begin_params
  = ws '(' ws

end_params
  = ws ')' ws

comma
  = ws ',' ws

equal
  = ws '=' ws

end_object
  = ws ";" ws

begin_boundary
  = ws "{" ws

end_boundary
  = ws "}" ws

ws "whitespace" = [ \t\n\r]*