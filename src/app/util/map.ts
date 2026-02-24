import { DateTime } from 'luxon';
import { MapCoordinates, MapMarkerData } from 'src/app/model/map.model';
import { FirstCharacterPipe } from 'src/app/shared/pipe/first-character/first-character.pipe';
import DateConst from '../const/date';
import { EventLocation } from '../screen/fleets/fleets.model';
import { FleetCheckbox } from '../screen/settings/settings-core/settings-core-companies/settings-core-companies-create-fleet-access-dialog/settings-core-companies-create-fleet-access-dialog.component';
import { FleetsTreeElement, MapVehiclesElement } from '../store/common-objects/common-objects.model';

export type FlatFleet = Omit<FleetsTreeElement, 'children'>;

const firstCharacterPipe = new FirstCharacterPipe();

const driverTag = (driver: MapVehiclesElement['driver'] | undefined) => {
  if (driver) {
    const bg = driver.id % 3 === 0 ? 'bg-main-primary' : driver.id % 3 === 1 ? 'bg-extra-three' : 'bg-extra-four';
    return `
      <div class='flex items-center gap-1'>
        <div class='w-[16px] h-[16px] flex justify-center items-center rounded-full ${bg}'>
          <p class='font-medium text-xs text-white'> ${firstCharacterPipe.transform(driver.name)}</p>
        </div>
        <p class='font-medium text-xs text-dark-electric-blue'>${driver.name}</p>
      </div>
    `;
  }
  return '';
};

const MapUtil = {
  mapVehicleToMapMarkerData(vehicle: MapVehiclesElement): MapMarkerData {
    let timeDisplay = '';
    if (vehicle.time) {
      const dateTime = DateTime.fromFormat(vehicle.time, DateConst.serverDateTimeFormat);
      const formattedTime = dateTime.toFormat(DateConst.clientDateTimeFormat);
      timeDisplay = `<p class="font-normal text-xs">Location time: ${formattedTime}</p>`;
    }

    return {
      id: vehicle.device_id,
      vehicleId: vehicle.vehicle_id,
      coordinates: vehicle.last_coordinates,
      direction: vehicle.direction,
      fillColorVariable: vehicle.active ? '--main-primary' : '--manatee',
      strokeColorVariable: vehicle.active ? '--main-primary' : '--manatee',
      type: 'navigation',
      infoWindow: `
        <div class='flex flex-col gap-1 m-1'>
          <p class=" font-semibold text-xs">${vehicle.registration_plate}</p>
           ${timeDisplay}

          ${driverTag(vehicle.driver)}
        </div>
      `
    };
  },

  mapToLatLng(coordinates: MapCoordinates | undefined | null): google.maps.LatLngLiteral | undefined {
    const [lat, lng] = coordinates || [];
    return lat == null || lng == null || isNaN(Number(lat)) || isNaN(Number(lng)) ? undefined : { lat: Number(lat), lng: Number(lng) };
  },

  mapToPrefixedFleetsTree(fleets: FleetsTreeElement[], prefix?: string): FleetsTreeElement[] {
    return fleets.map(fleet => {
      const name = prefix ? `${prefix} > ${fleet.name}` : fleet.name;
      return { ...fleet, name, children: this.mapToPrefixedFleetsTree(fleet.children, name) };
    });
  },

  mapToFlatFleets(fleets: FleetCheckbox[]): FleetCheckbox[] {
    return fleets.flatMap(({ children, ...fleet }): FleetCheckbox[] => [{ ...fleet, children }, ...this.mapToFlatFleets(children)]);
  },

  mapToFlatFleetsElement(fleets: FleetsTreeElement[]): FleetsTreeElement[] {
    return fleets.flatMap(({ children, ...rest }) => [{ ...rest, children }, ...this.mapToFlatFleetsElement(children)]);
  },

  mapEventLocationToMapMarkerData(location: EventLocation): MapMarkerData {
    const coordinates: MapCoordinates = [parseFloat(location.lat), parseFloat(location.lon)];
    const hash = Array.from(location.event_id).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const color = hash % 2 === 0 ? '#00B8D4' : '#FF6D00';

    return {
      id: location.event_id,
      coordinates,
      type: 'event',
      infoWindow: `
        <div class='flex flex-col gap-1 m-1'>
          <p class=" font-semibold text-xs">${location.registration_plate}</p>
          <p class='font-medium text-xs text-dark-electric-blue'>${location.event_type}</p>
          <p class='text-xs text-gray-500'>${location.occurence_time}</p>
        </div>
      `
    };
  }
};

export default MapUtil;
