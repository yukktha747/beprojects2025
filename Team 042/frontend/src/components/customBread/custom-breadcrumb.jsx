import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
// Assuming these are correctly imported and set up
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const CustomBreadcrumb = () => {
  const location = useLocation();
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  useEffect(() => {
    const pathnames = location.pathname === '/' ? [] : location.pathname.split('/').filter((x) => x);
    setBreadcrumbs(['Dashboard', ...pathnames]);
  }, [location]);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((breadcrumb, index) => {
          const routeTo = `/${breadcrumbs.slice(0, index + 1).join('/')}`;
          const isLast = index === breadcrumbs.length - 1;

          return (
            <BreadcrumbItem key={breadcrumb} className="flex">
              {isLast ? (
                <span>{breadcrumb}</span> // Simplified for the last breadcrumb
              ) : (
                <>
                  <BreadcrumbLink as={Link} to={routeTo}>
                    {breadcrumb}
                  </BreadcrumbLink>
                  <BreadcrumbSeparator>
                    <ChevronRight className="h-4 w-4" />
                  </BreadcrumbSeparator>
                </>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default CustomBreadcrumb;
