function generateGoogleMapLink(latitude, longitude) {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}

export default generateGoogleMapLink;