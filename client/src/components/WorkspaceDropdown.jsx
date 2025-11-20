import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Plus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentWorkspace } from "../features/workspaceSlice";
import { useNavigate } from "react-router-dom";
import { useClerk, useOrganizationList, useOrganization } from "@clerk/clerk-react";

function WorkspaceDropdown() {
  const { setActive, userMemberships, isLoaded } = useOrganizationList({ userMemberships: true });
  const { organization: activeOrg } = useOrganization(); // ✅ correct source for active workspace

  const { openCreateOrganization } = useClerk();
  const { workspaces, currentWorkspace } = useSelector((state) => state.workspace);

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSelectWorkspace = (orgId) => {
    if (activeOrg?.id !== orgId) {
      setActive({ organization: orgId }); // ✅ only update if different
    }
    dispatch(setCurrentWorkspace(orgId));
    setIsOpen(false);
    navigate("/");
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Prevent infinite loop by comparing against real activeOrg
  useEffect(() => {
    if (isLoaded && currentWorkspace && activeOrg?.id !== currentWorkspace.id) {
      setActive({ organization: currentWorkspace.id });
    }
  }, [currentWorkspace, isLoaded, activeOrg?.id, setActive]);

  return (
    <div className="relative m-4" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between p-3 rounded hover:bg-gray-100 dark:hover:bg-zinc-800"
      >
        <div className="flex items-center gap-3">
          <img src={currentWorkspace?.image_url} alt="" className="w-8 h-8 rounded" />
          <div>
            <p className="font-semibold text-sm">{currentWorkspace?.name || "Select Workspace"}</p>
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              {workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-64 bg-white dark:bg-zinc-900 border rounded shadow-lg top-full left-0">
          <div className="p-2">
            <p className="text-xs uppercase text-gray-500 dark:text-zinc-400 px-2 mb-2">
              Workspaces
            </p>

            {userMemberships.data.map(({ organization }) => (
              <div
                key={organization.id}
                onClick={() => onSelectWorkspace(organization.id)} // ✅ correct click handler
                className="flex items-center gap-3 p-2 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-zinc-800"
              >
                <img src={organization.imageUrl} alt="" className="w-6 h-6 rounded" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{organization.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {organization.membersCount || 0} members
                  </p>
                </div>
                {currentWorkspace?.id === organization.id && (
                  <Check className="w-4 h-4 text-blue-600" />
                )}
              </div>
            ))}
          </div>

          <hr className="border-gray-200 dark:border-zinc-700" />

          <div
            className="p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800"
            onClick={() => {
              openCreateOrganization();
              setIsOpen(false);
            }}
          >
            <p className="flex items-center text-sm gap-2 text-blue-600">
              <Plus className="w-4 h-4" /> Create Workspace
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkspaceDropdown;
