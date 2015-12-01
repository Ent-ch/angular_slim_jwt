<?php

class RestDAO 
{
    private $db;
    
    public function __construct() 
    {
        $this->db = $this->getDBConn();
    }
  
    private function getDBConn() 
    {
        $dbh = new PDO("mysql:host=" . DBHOST .";dbname=". DBNAME, DBUSER, DBPASS);  
        $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        return $dbh;
    }

    public function getAll($tableName, $orderCol = 'id', $where = '') 
    {
        $sql = "SELECT * FROM `{$tableName}` {$where} ORDER BY {$orderCol} DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_OBJ);

        return $result;
    }

  public function insert($tableName, $data = array()) 
  {
        $dataKeys = array_keys($data);
        $sql = "INSERT INTO `{$tableName}` (`" . implode($dataKeys, '`, `') . "`) VALUES(:" . implode($dataKeys, ', :') . ")";
        $stmt = $this->db->prepare($sql);
        foreach ($data as $key => &$val) {
            $stmt->bindParam(":{$key}", $val);
        }
        $stmt->execute();
  }

  public function getById($tableName, $id) 
  {
        $sql = "SELECT * FROM {$tableName} WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam("id", $id);
        $stmt->execute();
        $result = $stmt->fetchObject();  

        return $result;
  }

  public function getByCode($tableName, $code) 
  {
        return $this->getByField($tableName, 'code', $code);
  }

  public function getByField($tableName, $field, $value) 
  {
        $sql = "SELECT * FROM `{$tableName}` WHERE `{$field}` = :val";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam("val", $value);
        $stmt->execute();
        $result = $stmt->fetchObject();  

        return $result;
  }

  public function getKey($project) 
  {
        $sql = "SELECT * FROM `keys` WHERE project = :project AND status = 1";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam("project", $project);
        $stmt->execute();
        $result = $stmt->fetchObject();  

        return $result;
  }

  public function update($vo)
  {
      $stmt = $this->db->prepare("UPDATE projects SET name = :name, status = :status WHERE id = :id");  
      $stmt->bindParam("name", $vo->name);
      $stmt->bindParam("status", $vo->status);
      $stmt->bindParam("id", $vo->id);
      $stmt->execute();
      return $vo;
  }

  public function updateStatus($tableName, $id, $status)
  {
      $stmt = $this->db->prepare("UPDATE `{$tableName}` SET status = :status WHERE id = :id");  
      $stmt->bindParam("status", $status);
      $stmt->bindParam("id", $id);
      $stmt->execute();
  }

  public function delete($tableName, $id) 
  {
      $stmt = $this->db->prepare("DELETE FROM `{$tableName}` WHERE id = :id");  
      $stmt->bindParam("id", $id);
      $stmt->execute();
  }

}