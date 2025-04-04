import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";

function Language_Selector({ setSelectedLanguage }) {
  const [lang, setLang] = useState("Select Language");

  const handleSelect = (eventKey) => {
    setLang(eventKey);
    setSelectedLanguage(eventKey);
  };

  return (
    <DropdownButton
      id="dropdown-basic-button"
      title={lang}
      onSelect={handleSelect}
    >
      <Dropdown.Item eventKey="English">English</Dropdown.Item>
      <Dropdown.Item eventKey="Hindi">Hindi</Dropdown.Item>
      <Dropdown.Item eventKey="Tamil">Tamil</Dropdown.Item>
      <Dropdown.Item eventKey="Telugu">Telugu</Dropdown.Item>
      <Dropdown.Item eventKey="Kannada">Kannada</Dropdown.Item>
      <Dropdown.Item eventKey="Malayalam">Malayalam</Dropdown.Item>
      <Dropdown.Item eventKey="Marathi">Marathi</Dropdown.Item>
      <Dropdown.Item eventKey="Bengali">Bengali</Dropdown.Item>
      <Dropdown.Item eventKey="Punjabi">Punjabi</Dropdown.Item>
      <Dropdown.Item eventKey="Urdu">Urdu</Dropdown.Item>
      <Dropdown.Item eventKey="Gujrati">Gujrati</Dropdown.Item>
    </DropdownButton>
  );
}

export default Language_Selector;
