import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import EditorPanel from '../components/EditorPanel'
import PDFPreview from '../components/PDFPreview'
import Toolbar from '../components/Toolbar'
import TemplateSwitcher from '../components/TemplateSwitcher'
import ExportButtons from '../components/ExportButtons'

const ResumeEditor = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1600px] mx-auto h-screen p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Toolbar />
            <TemplateSwitcher />
          </div>
          <ExportButtons />
        </div>
        <PanelGroup direction="horizontal">
          <Panel minSize={25} defaultSize={45} className="h-full">
            <div className="h-full overflow-y-auto pr-3">
              <EditorPanel />
            </div>
          </Panel>
          <PanelResizeHandle className="w-1 bg-slate-200 rounded" />
          <Panel minSize={25} defaultSize={55} className="h-full">
            <div className="h-full">
              <PDFPreview />
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  )
}

export default ResumeEditor


