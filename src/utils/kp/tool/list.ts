import { removeEmptyAndNull } from "@/utils/kp/tool/json"
import type { Emitter } from "mitt"
import type { PageData } from "@/utils/kp/data/systemData"

export function kpSelectChange(eventBus: Emitter<any>, queryParams: PageData) {
  queryParams.pageNum = 1
  eventBus.emit("queryList", removeEmptyAndNull(queryParams))
}

export function kpUseCardTreeChange(selectedValue, eventBus: Emitter<any>) {
  eventBus.emit("queryThree", { projectId: selectedValue })
}
