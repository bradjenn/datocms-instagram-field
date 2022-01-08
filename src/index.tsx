import { connect, RenderFieldExtensionCtx } from "datocms-plugin-sdk";
import "datocms-react-ui/styles.css";
import { render } from "./utils/render";
import ConfigScreen from "./entrypoints/ConfigScreen";
import InstagramFeed from "./entrypoints/InstagramFeed";

connect({
  renderConfigScreen(ctx) {
    return render(<ConfigScreen ctx={ctx} />);
  },

  manualFieldExtensions() {
    return [
      {
        id: "instagramFeed",
        name: "Instagram Browser",
        type: "editor",
        fieldTypes: ["json"],
      },
    ];
  },

  renderFieldExtension(fieldExtensionId: string, ctx: RenderFieldExtensionCtx) {
    if (fieldExtensionId === "instagramFeed") {
      return render(<InstagramFeed ctx={ctx} />);
    }
  },
});
