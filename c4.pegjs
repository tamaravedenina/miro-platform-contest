text
  = test:template* { return test; }

template
  = shape_template
  / relationship_template
  / enterprise_boundary_template

shape_template
  = chars:variable_chart+ equal role:shape start_params name:string comma description:string end_params end_object { return {"type": role, "name": name, "description": description, "variable": chars.join("")}; }

shape
  = person
  / software_system
  / existing_software_system

relationship_template
  = role:relationship start_params start_variable:variable_chart+ comma end_variable:variable_chart+ comma description:string end_params end_object { return {"type": role, "description": description, "start": start_variable.join(""), "end": end_variable.join("")}; }

enterprise_boundary_template
  = role:enterprise_boundary start_params name:string comma description:string end_params end_object { return {"type": role, "name": name, "description": description, "variable": chars.join("")}; }

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
  = "SoftwareSystem"i { return 2; }

existing_software_system
  = "ExistingSoftwareSystem"i { return 3; }

relationship
  = "Relationship"i { return 4; }

enterprise_boundary
  = "EnterpriseBoundary"i { return 5; }

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

start_params
  = ws '(' ws

end_params
  = ws ')' ws

comma
  = ws ',' ws

equal
  = ws '=' ws

end_object
  = ws ";" ws

ws "whitespace" = [ \t\n\r]*