import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Icon,
} from "@chakra-ui/core";

const Breadcrumbs = ({ links }) => (
  <Breadcrumb
    spacing="8px"
    separator={<Icon color="gray.300" name="chevron-right" />}
    mb="1rem"
  >
    {links.map(([name, location], index) => (
      <BreadcrumbItem key={index} isCurrentPage={index === links.length - 1}>
        <BreadcrumbLink href={location}>{name}</BreadcrumbLink>
      </BreadcrumbItem>
    ))}
  </Breadcrumb>
);

export default Breadcrumbs;
