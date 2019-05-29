import React, { Component } from 'react';
import { Nav, Navbar, Form, FormControl, Button } from 'react-bootstrap';
import { Col, Container, Row } from 'react-bootstrap';
import Autosuggest from 'react-autosuggest';

// Teach Autosuggest how to calculate suggestions for any given input value.
function getSuggestions(value) {
  console.log("getSuggestions: " + value);
  return handleAddressSearch(value);
}

async function handleAddressSearch(addressSearchText) {
  //this.setState({addressSearchText: event.target.value});
  var searchText = addressSearchText + '.json';
  console.log("handleAddressSearch START");
  console.log('searchText: ' + searchText);
  var url = new URL('https://api.tomtom.com/search/2/geocode/' + searchText);
  console.log('url: ' + url);
  var params = {
    typeahead: true,
    countryset: 'NZ',
    key: 'DhR7dQXpVyPK02V65PUKp6HUNH2H1ShX',
  };
  url.search = new URLSearchParams(params);

  var addressSearchResults = [];

  await fetch(url)
  .then(response => response.json())
  .then(data => {
    if(Array.isArray(data.results) && data.results.length > 0) {

      var responseObj = JSON.parse(JSON.stringify(data.results));
      for(var i = 0; i < responseObj.length; i++) {
        console.log(responseObj[i].address.freeformAddress);
        addressSearchResults.push(responseObj[i].address.freeformAddress);
        //console.log("handleAddressSearch fetch END");
        //return addressSearchResults;
      }
    }
    //this.setState({
    //  suggestions: addressSearchResults,
    //});
  })
  .catch((error) => {
    console.log(error);
  });
  console.log("handleAddressSearch END");
  return addressSearchResults;
}


// When suggestion is clicked, Autosuggest needs to populate the input
// based on the clicked suggestion. Teach Autosuggest how to calculate the
// input value for every given suggestion.
const getSuggestionValue = suggestion => suggestion;

// Use your imagination to render suggestions.
const renderSuggestion = suggestion => {
  console.log("renderSuggestion: " + suggestion);
  return (<div>
    {suggestion}
  </div>);
};


class Map extends Component {

  constructor(props) {
    super();
    this.state = {
      latitude: '',
      longitude: '',
      addressSearchText: '',
      tmap: '',
      value: '',
      suggestions: [],
    };
    this.script = null;

    this.getMyLocation = this.getMyLocation.bind(this);
    this.handleAddressSelect = this.handleAddressSelect.bind(this);
    this.putMapMarker = this.putMapMarker.bind(this);
    //this.getSuggestions = this.getSuggestions.bind(this);
    this.onSuggestionsFetchRequested = this.onSuggestionsFetchRequested.bind(this);
    //this.handleAddressSearch = this.handleAddressSearch.bind(this);
    this.onSuggestionSelected = this.onSuggestionSelected.bind(this);

  }


  onChange = (event, { newValue }) => {
    console.log("onChange: " + newValue);
    this.setState({
      value: newValue
    });
  };

  // Autosuggest will call this function every time you need to update suggestions.
  // You already implemented this logic above, so just use it.
  //onSuggestionsFetchRequested = ({ value }) => {
  async onSuggestionsFetchRequested({value}) {
    console.log("onSuggestionsFetchRequested: " + value);

    // const curSuggestions = getSuggestions(value).then(
    //   () => {
    //     this.setState({
    //       suggestions: curSuggestions,
    //     });
    //     console.log("after setState");
    //   }
    // );

    //const curSuggestions = await getSuggestions(value);

    this.setState({
      suggestions: await getSuggestions(value),
    });
    console.log("after setState");

    //getSuggestions(value);
    // this.setState({
    //   suggestions: curSuggestions,
    // });
    console.log("onSuggestionsFetchRequested DONE ");
  };

  // Autosuggest will call this function every time you need to clear suggestions.
  onSuggestionsClearRequested = () => {
    console.log("onSuggestionsClearRequested");
    //this.setState({
    //  suggestions: []
    //});
  };

  onSuggestionSelected(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) {
    //console.log("onSuggestionSelected" + suggestion + ", " + suggestionValue + ", " + method);
    var searchText = suggestion + '.json';
    console.log("geocode search on " + searchText);
    this.geocodeAddressSearch(searchText);
  };

  putMapMarker(latitude, longitude, address) {
      // console.log("latitude: " + latitude);
      // console.log("longitude: " + longitude);
      // console.log("address: " + address);

      this.script = document.createElement('script');
      this.script.src = process.env.PUBLIC_URL + '/sdk/tomtom.min.js';
      console.log('script.src: ' + this.script.src);
      document.body.appendChild(this.script);
      this.script.async = false;
      this.script.onload = function () {
        var location = [ latitude, longitude ];
        var marker = window.tomtom.L.marker(location);
        marker.bindPopup(address);
        console.log("cmap(putMapMarker): " + window.cmap.getStaticMapUrl( ));
        marker.addTo(window.cmap);
        window.cmap.setView(location, 15);
      };
  }


  componentDidMount() {
    this.getMyLocation();
    //const { latitude, longitude } = this.state;
    console.log('(componentDidMount)inputProps: ' + this.state.inputProps);
  }

  getMap (latitude, longitude) {
    this.script = document.createElement('script');
    this.script.src = process.env.PUBLIC_URL + '/sdk/tomtom.min.js';
    console.log('script.src: ' + this.script.src);
    document.body.appendChild(this.script);
    this.script.async = false;
    this.script.onload = function () {
      console.log("generating map");
      window.cmap = window.tomtom.L.map('map', {
         source: 'vector',
         key: 'DhR7dQXpVyPK02V65PUKp6HUNH2H1ShX',
         center: [latitude, longitude],
         basePath: '/sdk',
         zoom: 15
      });
      console.log("done");
    };
    console.log("cmap(getMap): " + window.cmap);
  }

  getMyLocation() {
    const location = window.navigator && window.navigator.geolocation;
    if(location) {
      location.getCurrentPosition((position) => {
        this.setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        this.getMap(this.state.latitude, this.state.longitude);
        console.log("this.state.latitude: " + this.state.latitude);
        console.log("this.state.longitude: " + this.state.longitude);
      }, (error) => {
        console.log("error getting current position");
      });
    }
  }

  handleAddressSelect(event) {
    this.setState({addressSearchText: event.target.value});
    var searchText = document.getElementById("addressSearchText").value + '.json';
    console.log('searchText: ' + searchText);
    var url = new URL('https://api.tomtom.com/search/2/geocode/' + searchText);
    console.log('url: ' + url);
    var params = {
      typeahead: true,
      countryset: 'NZ',
      key: 'DhR7dQXpVyPK02V65PUKp6HUNH2H1ShX',
    };
    url.search = new URLSearchParams(params);

    fetch(url)
    .then(response => response.json())
    .then(data => {
      console.log("data: " + JSON.stringify(data));
      this.setState({ addressSearchResults: JSON.stringify(data) });
      //var resultString = JSON.stringify(data);
      console.log("resultString.results: " + JSON.stringify(data.results[0].position.lat));
      this.putMapMarker(data.results[0].position.lat, data.results[0].position.lon, document.getElementById("addressSearchText").value);
    });
  }

  geocodeAddressSearch(addressSearchText) {

    var url = new URL('https://api.tomtom.com/search/2/geocode/' + addressSearchText);
    console.log('url: ' + url);
    var params = {
      typeahead: true,
      countryset: 'NZ',
      key: 'DhR7dQXpVyPK02V65PUKp6HUNH2H1ShX',
    };
    url.search = new URLSearchParams(params);

    fetch(url)
    .then(response => response.json())
    .then(data => {
      console.log("data: " + JSON.stringify(data));
      this.setState({ addressSearchResults: JSON.stringify(data) });
      //var resultString = JSON.stringify(data);
      console.log("resultString.results: " + JSON.stringify(data.results[0].position.lat));
      this.putMapMarker(data.results[0].position.lat, data.results[0].position.lon, document.getElementById("addressSearchText").value);
    });

  }

  render () {

    const { value, suggestions } = this.state;
    console.log("suggestions: " + suggestions);

    const inputProps = {
        placeholder: 'Type address',
        value,
        onChange: this.onChange,
    };

    return(
      <Container>
        <Row>
          <Col>
            <Navbar bg="light" expand="lg" fixed="top">
            <Navbar.Brand href="/">Alay</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="mr-auto">
                <Autosuggest
                  suggestions={suggestions}
                  onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                  onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                  onSuggestionSelected={this.onSuggestionSelected}
                  getSuggestionValue={getSuggestionValue}
                  renderSuggestion={renderSuggestion}
                  inputProps={inputProps}
                />
              </Nav>
              <Form inline id="addressSearchForm" name="addressSearchForm">
                <FormControl
                  type="text"
                  placeholder="Enter address"
                  className="mr-sm-2"
                  id="addressSearchText"
                  >
                </FormControl>
                <Button variant="outline-success" onClick={this.handleAddressSelect}>Search</Button>
              </Form>
            </Navbar.Collapse>
            </Navbar>
          </Col>
        </Row>
        <Row>
          <Col>
            <div id='map'></div>
          </Col>
        </Row>
      </Container>
    );
  }

}

export default Map;
