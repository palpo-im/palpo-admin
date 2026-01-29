import { Avatar, Box, Link } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useEffect, useState } from "react";

const Footer = () => {
  const [version, setVersion] = useState<string | null>(null);
  const theme = useTheme();

  useEffect(() => {
    const version = document.getElementById("js-version")?.textContent;
    if (version) {
      setVersion(version);
    }
  }, []);

  return (
    <Box
      component="footer"
      sx={{
        position: "fixed",
        zIndex: 100,
        bottom: 0,
        width: "100%",
        bgcolor: theme.palette.background.default,
        color: theme.palette.text.primary,
        borderTop: "1px solid",
        borderColor: theme.palette.divider,
        fontSize: "0.89rem",
        display: "block",
        p: 1,
        gap: "10px",
      }}
    >
      <Avatar
        src="./images/logo.webp"
        sx={{ width: "1rem", height: "1rem", display: "inline-block", verticalAlign: "sub" }}
      />{" "}
      <Link href="https://github.com/palpo-im/palpo-admin" target="_blank">
        Palpo Admin {version}
      </Link>{" "}
      by{" "}
      <Link href="https://palpo.im" target="_blank">
        Palpo
      </Link>
    </Box>
  );
};

export default Footer;
