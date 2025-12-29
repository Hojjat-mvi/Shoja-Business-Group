import {
    PiHouseLineDuotone,
    PiUsersDuotone,
    PiBuildingsDuotone,
    PiFileTextDuotone,
} from 'react-icons/pi'

export type NavigationIcons = Record<string, JSX.Element>

const navigationIcon: NavigationIcons = {
    home: <PiHouseLineDuotone />,
    users: <PiUsersDuotone />,
    building: <PiBuildingsDuotone />,
    document: <PiFileTextDuotone />,
}

export default navigationIcon
