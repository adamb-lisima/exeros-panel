import { TreeControl } from 'src/app/shared/component/control/tree-control/tree-control.model';
import { FleetsTreeElement } from '../store/common-objects/common-objects.model';

const ControlUtil = {
  mapFleetsTreeToTreeControls(data: FleetsTreeElement[]): TreeControl[] {
    return data.map(fleet => ({ value: fleet.id, label: fleet.name, profile: fleet.profile, children: ControlUtil.mapFleetsTreeToTreeControls(fleet.children) }));
  }
};

export default ControlUtil;
