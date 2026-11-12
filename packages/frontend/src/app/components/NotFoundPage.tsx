import { Box, Button, Container, Typography } from "@mui/material";
import { Link } from "react-router";

export function NotFoundPage() {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: 2,
        }}
      >
        <Typography component="h2" variant="h2" color="primary" sx={{ fontWeight: 600 }}>
          404
        </Typography>
        <Typography component="h1" variant="h4">
          Nie znaleziono strony
        </Typography>
        <Typography color="text.secondary">
          Strona, której szukasz, nie istnieje lub została przeniesiona.
        </Typography>
        <Button component={Link} to="/" variant="contained" sx={{ mt: 1 }}>
          Wróć na stronę główną
        </Button>
      </Box>
    </Container>
  );
}
