# API documentation Monitoring Service

## @POST "/event"
|keys|type|
|---|---|
| description | string |
| type | string |
| risk | number |
| location | object |
| timeLoss | number |
| timeStamp | number |

post event to server

## @GET "/route"
|keys|type|
|---|---|
|sLat| number |
|sLng| number |
|eLat| number |
|eLng| number |
|user| number |

returns geoJSON of Route

## @GET "/report"
|keys|type|
|---|---|
|start|string|
|end|string|

returns all events in selected time period

## @GET "/isUserInDanger"
|keys|type|
|---|---|
|user|number|

returns true or false depending if user is traveling on route that itersects an event.

