
import { Box } from "@chakra-ui/layout";
import PageMap from "@/components/PageMap";
import PageBuilderProvider from "@/providers/Page";

const IndexPage = () => (
  <Box position="fixed" inset={0} display="flex">
    <PageBuilderProvider>
      <PageMap />
    </PageBuilderProvider>
  </Box>
);

export default IndexPage;
